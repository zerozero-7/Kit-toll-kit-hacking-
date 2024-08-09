const { ApplicationCommandOptionType, ActionRowBuilder, ChannelSelectMenuBuilder } = require("discord.js");
const { dbEmojis, dbPermissions, dbSugestions } = require("./../../../../databases/index");

module.exports = {
  name: "sugestões",
  description: "[⚙️] Um novo método de sugestões totalmente personalizado.",
  options: [
    { name: "adicionar", description: "[⚙️] Adicione um novo canal para sugestões.", type: ApplicationCommandOptionType.Subcommand },
    { name: "ver", description: "[⚙️] Veja os canais configurados para sugestões.", type: ApplicationCommandOptionType.Subcommand },
    { name: "remover", description: "[⚙️] Remova um canal configurado para sugestões.", type: ApplicationCommandOptionType.Subcommand },
  ],

  run: async (client, interaction) => {

    const ownerId = await dbPermissions.get(interaction.user.id);
    if (ownerId != interaction.user.id) {
      await interaction.reply({
        content: `${dbEmojis.get('negar')} | Você não tem permissão para usar este comando.`,
        ephemeral: true
      });
      return;
    };

    switch (interaction.options.getSubcommand()) {

      case 'adicionar': {
        const rowChannels = new ActionRowBuilder()
          .addComponents(
            new ChannelSelectMenuBuilder().setCustomId('channelsMenu').setPlaceholder('Selecione um Canal')
          );

        await interaction.reply({
          content: `🗂️ | Selecione um canal no menu abaixo!`,
          components: [rowChannels],
          ephemeral: true
        });

        try {
          const iChannel = await interaction.channel.awaitMessageComponent({ time: 120000 });

          if (iChannel.customId === 'channelsMenu') {
            const valueSelected = iChannel.values[0];
            const channelSelected = await client.channels.fetch(valueSelected);

            const channelExisting = await dbSugestions.get(channelSelected.id);
            if (channelExisting) {
              await interaction.editReply({
                content: `${dbEmojis.get('negar')} | O canal ${channelSelected} já está configurado para usar funções de sugestão.`,
                components: [],
                ephemeral: true
              });
              return;
            }

            await dbSugestions.set(`${channelSelected.id}.id`, channelSelected.id);
            await dbSugestions.set(`${channelSelected.id}.guild`, interaction.guild.id);
            await dbSugestions.set(`${channelSelected.id}.channel`, channelSelected.id);

            await interaction.editReply({
              content: `${dbEmojis.get('aceitar')} | Agora o canal ${channelSelected} tem as funções de sugestão.`,
              components: [],
              ephemeral: true
            });

          }
        } catch (err) {
          console.error('Erro ao selecionar o canal:', err);
          await interaction.editReply({
            content: `${dbEmojis.get('negar')} | Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.`,
            components: [],
            ephemeral: true
          });
        }

        break;
      };

      case 'ver': {
        const allChannels = await dbSugestions.all();

        if (!allChannels || allChannels.length === 0) {
          await interaction.reply({
            content: `${dbEmojis.get('negar')} | Nenhum canal configurado para sugestões.`,
            ephemeral: true
          });
          return;
        }

        let response = '📋 | Canais configurados para sugestões:\n\n';
        allChannels.forEach(allcanais => {
          const { id, guild, channel } = allcanais.data;
          response += `🔹 <#${channel}> (ID: ${id})\n`;
        });

        await interaction.reply({
          content: response,
          ephemeral: true
        });

        break;
      };

      case 'remover': {
        const rowChannels = new ActionRowBuilder()
          .addComponents(
            new ChannelSelectMenuBuilder().setCustomId('channelsMenuRemove').setPlaceholder('Selecione um Canal para Remover')
          );

        await interaction.reply({
          content: `🗑️ | Selecione um canal no menu abaixo para remover!`,
          components: [rowChannels],
          ephemeral: true
        });

        try {
          const iChannel = await interaction.channel.awaitMessageComponent({ time: 120000 });

          if (iChannel.customId === 'channelsMenuRemove') {
            const valueSelected = iChannel.values[0];
            const channelSelected = await client.channels.fetch(valueSelected);

            const channelExisting = await dbSugestions.get(channelSelected.id);
            if (!channelExisting) {
              await interaction.editReply({
                content: `${dbEmojis.get('negar')} | O canal ${channelSelected} não está configurado para sugestões.`,
                components: [],
                ephemeral: true
              });
              return;
            }

            await dbSugestions.delete(channelSelected.id);

            await interaction.editReply({
              content: `${dbEmojis.get('aceitar')} | O canal ${channelSelected} foi removido das funções de sugestão.`,
              components: [],
              ephemeral: true
            });

          }
        } catch (err) {
          console.error('Erro ao remover o canal:', err);
          await interaction.editReply({
            content: `${dbEmojis.get('negar')} | Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.`,
            components: [],
            ephemeral: true
          });
        }

        break;
      };

    };

  },
};