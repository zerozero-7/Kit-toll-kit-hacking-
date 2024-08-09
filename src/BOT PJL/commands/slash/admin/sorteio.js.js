const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { dbEmojis, dbPermissions, dbGiveaway } = require("../../../../databases/index");

const ms = require('ms');

async function handleParticipantsListInteraction(interaction, participants) {
  const MAX_CHARACTERS = 1900;
  const participantsList = participants.map(userId => `<@${userId}> - ${userId}`).join('\n');

  if (participantsList.length <= MAX_CHARACTERS) {
    await interaction.reply({
      content: `Participantes do sorteio:\n${participantsList}`,
      ephemeral: true
    });
  } else {
    const fileName = 'participants.txt';
    const fileContents = participants.map(userId => `<@${userId}> - ${userId}`).join('\n');
    const buffer = Buffer.from(fileContents, 'utf-8');

    await interaction.reply({
      content: `A lista de participantes excede o limite de caracteres. Enviando como arquivo de texto.`,
      ephemeral: true
    });

    await interaction.user.send({
      files: [{
        attachment: buffer,
        name: fileName
      }],
    });
  }
};

module.exports = {
  name: "sorteio",
  description: "[🎉] Gerencie sorteios por aqui.",
  options: [
    { name: "criar", description: "[🎉] Crie um novo sorteio.", type: ApplicationCommandOptionType.Subcommand },
    { name: "delete", description: "[🎉] Delete um sorteio do meu banco de dados.", type: ApplicationCommandOptionType.Subcommand },
    { name: "setup", description: "[🎉] Envie os paineis criardos.", type: ApplicationCommandOptionType.Subcommand, options: [{ name: "channel", description: "[🎉] Selecione um canal para enviar o painel.", type: ApplicationCommandOptionType.Channel, required: true }, { name: "description", description: "[🎉] Faça uma descrição para o seu sorteio.", type: ApplicationCommandOptionType.String, required: true }, { name: "time", description: "[🎉] Escolha um tempo de duração do sorteio.", type: ApplicationCommandOptionType.String, required: true, choices: [{ name: "30 Segundos", value: "30s", }, { name: "1 Minuto", value: "1m", }, { name: "5 Minutos", value: "5m", }, { name: "10 Minutos", value: "10m", }, { name: "15 Minutos", value: "15m", }, { name: "30 Minutos", value: "30m", }, { name: "45 Minutos", value: "45m", }, { name: "1 Hora", value: "1h", }, { name: "2 Horas", value: "2h", }, { name: "5 Horas", value: "5h", }, { name: "12 Horas", value: "12h", }, { name: "24 Horas", value: "24h", }, { name: "1 Dia", value: "24h", }, { name: "3 dias", value: "72h", }, { name: "1 Semana", value: "168h", },], }, { name: "image", description: "[🎉] Faça o envio de alguma imagem para o sorteio.", type: ApplicationCommandOptionType.String }] },
    { name: "resortear", description: "[🎉] Resortear e escolher um novo vencedor.", type: ApplicationCommandOptionType.Subcommand },
    { name: "ver-sorteios", description: "[🎉] Visualize os sorteios criados neste servidor.", type: ApplicationCommandOptionType.Subcommand }
  ],

  run: async (client, interaction) => {

    const guildId = interaction.guild.id;

    const ownerId = await dbPermissions.get(interaction.user.id);
    if (ownerId != interaction.user.id) {
      await interaction.reply({
        content: `${dbEmojis.get('negar')} | Você não tem permissão para usar este comando.`,
        ephemeral: true
      });
      return;
    };

    switch (interaction.options.getSubcommand()) {

      case "criar": {

        const id = await dbGiveaway.get(`${interaction.guild.id}.id`)
        const nome = await dbGiveaway.get(`${interaction.guild.id}.nome`)
        const role = await dbGiveaway.get(`${interaction.guild.id}.role`)
        const premio = await dbGiveaway.get(`${interaction.guild.id}.premio`)

        const rowGiveaway = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`idGiveaway`)
            .setEmoji(`${dbEmojis.get(`idgiv`)}`)
            .setLabel(`ID`)
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`nomeGiveaway`)
            .setEmoji(`${dbEmojis.get(`namegiv`)}`)
            .setLabel(`Nome`)
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`roleGiveaway`)
            .setEmoji(`${dbEmojis.get(`rolegiv`)}`)
            .setLabel(`Cargo`)
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`premioGiveaway`)
            .setEmoji(`${dbEmojis.get(`premiogiv`)}`)
            .setLabel(`Premio`)
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`sendingGiveaway`)
            .setEmoji(`${dbEmojis.get(`sendinggiv`)}`)
            .setLabel(`Enviar`)
            .setStyle(ButtonStyle.Primary),
        );

        interaction.reply({
          content: `# **Gerenciador de Sorteios**\nGerencie as novas configurações do sorteio pelos botões abaixo.\n${dbEmojis.get(`idgiv`)} ID: ${id != `null` ? `${id}` : `Não configurado.`}\n${dbEmojis.get(`namegiv`)} Nome: ${nome != `null` ? `${nome}` : `Não configurado.`}\n${dbEmojis.get(`rolegiv`)} Cargo: ${role != `null` ? `${role}` : `Não configurado.`}\n${dbEmojis.get(`premiogiv`)} Premio: ${premio != `null` ? `${premio}` : `Não configurado.`}`,
          components: [rowGiveaway],
          ephemeral: true
        });

        break;

      };
      case "delete": {

        const giveawayData = await dbGiveaway.get(interaction.guild.id);
        if (!giveawayData) {
          await interaction.reply({
            content: "Não há sorteio registrado neste servidor.",
            ephemeral: true
          });
          return;
        };

        const ownerId = dbPermissions.get(interaction.user.id);
        if (ownerId !== interaction.user.id) {
          await interaction.reply({
            content: `${dbEmojis.get('negar')} | Você não tem permissão para deletar este sorteio.`,
            ephemeral: true
          });
          return;
        };

        await dbGiveaway.delete(interaction.guild.id);

        await interaction.reply({
          content: "O sorteio foi removido com sucesso.",
          ephemeral: true
        });

        break;
      };
      case "setup": {
        const channel = interaction.options.getChannel("channel");
        const description = interaction.options.getString("description");
        const image = interaction.options.getString("image") || "https://sem-img.com";
        const tempo = interaction.options.getString("time");

        const tempoMS = ms(tempo);
        const startTime = Date.now();
        const endTime = Math.floor((startTime + tempoMS) / 1000);

        const timer = ms(tempo);

        await dbGiveaway.set(`${guildId}.channel`, channel.id);
        await dbGiveaway.set(`${guildId}.description`, description);

        const role = await dbGiveaway.get(`${guildId}.role`);
        const prize = await dbGiveaway.get(`${guildId}.premio`);

        const roleDescription = role
          ? interaction.guild.roles.cache.get(role)?.toString() || 'Livre para todos do servidor'
          : 'Livre para todos do servidor!';

        const embed = new EmbedBuilder()
          .setAuthor({ name: client.user.username, iconURL: client.user.avatarURL() })
          .setColor("#000041")
          .setTitle(`${dbEmojis.get('premiogiv')} - Premiação do sorteio é: ${prize}`)
          .setImage(image)
          .setDescription(`${description}\n\nUse ${dbEmojis.get('utilização')} para participar!\n\n${dbEmojis.get('robozin')} Requisitos: ${roleDescription}.`)
          .setFields({ name: `Tempo Restante:`, value: `<t:${endTime}:R>`, inline: true });

        const button = new ButtonBuilder()
          .setCustomId('participarGiveaway')
          .setEmoji(`${dbEmojis.get('utilização')}`)
          .setStyle(ButtonStyle.Primary)
          .setLabel('Participar (0)');

        const buttonTwo = new ButtonBuilder()
          .setCustomId('verParticipantes')
          .setEmoji(`${dbEmojis.get('participantes')}`)
          .setStyle(ButtonStyle.Secondary)
          .setLabel('Ver Participantes');

        const actionRow = new ActionRowBuilder().addComponents(button, buttonTwo);

        await interaction.reply({
          content: `${dbEmojis.get('aceitar')} Seu sorteio foi enviado com sucesso.`,
          ephemeral: true
        });

        const message = await channel.send({ embeds: [embed], components: [actionRow] });

        const collector = message.createMessageComponentCollector({ time: timer });
        const participants = [];

        collector.on('collect', async i => {
          if (i.customId === 'participarGiveaway') {
            const member = i.guild.members.cache.get(i.user.id);

            if (role && !member.roles.cache.has(role)) {
              await i.reply({
                content: "Você não tem o cargo necessário para participar deste sorteio.",
                ephemeral: true
              });
              return;
            }

            if (!participants.includes(i.user.id)) {
              participants.push(i.user.id);
              await dbGiveaway.set(`${guildId}.users`, participants);

              const updatedButton = ButtonBuilder.from(button).setLabel(`Participar (${participants.length})`);
              const updatedButtonTwo = ButtonBuilder.from(buttonTwo).setLabel(`Ver Participantes`);
              const updatedActionRow = new ActionRowBuilder().addComponents(updatedButton, updatedButtonTwo);

              await i.update({ components: [updatedActionRow] });

              await i.followUp({
                content: "Você entrou no sorteio.",
                ephemeral: true
              });
            } else {
              await i.reply({
                content: "Você já está no sorteio.",
                ephemeral: true
              });
            }
          } else if (i.customId === 'verParticipantes') {
            await handleParticipantsListInteraction(i, participants);
          }
        });

        collector.on('end', async () => {
          if (participants.length === 0) {
            await channel.send('Sorteio cancelado pois ninguém participou!');
          } else {
            const winner = participants[Math.floor(Math.random() * participants.length)];
            await channel.send(`${dbEmojis.get('utilização')} Parabéns <@${winner}>! Você ganhou o ${prize}`);
          }
        });

        break;
      };
      case "resortear": {

        const giveawayChannelId = await dbGiveaway.get(`${guildId}.channel`);
        const giveawayUsers = await dbGiveaway.get(`${guildId}.users`);

        if (!giveawayChannelId || !giveawayUsers || giveawayUsers.length === 0) {
          await interaction.reply({
            content: "Não há sorteio ativo ou não há participantes para resortear.",
            ephemeral: true
          });
          return;
        };

        const giveawayChannel = interaction.guild.channels.cache.get(giveawayChannelId);
        if (!giveawayChannel) {
          await interaction.reply({
            content: "Não foi possível encontrar o canal do sorteio.",
            ephemeral: true
          });
          return;
        };

        const newWinner = giveawayUsers[Math.floor(Math.random() * giveawayUsers.length)];

        await giveawayChannel.send(`${dbEmojis.get('utilização')} Parabéns <@${newWinner}>! Você é o novo vencedor do sorteio.`);

        const updatedUsers = giveawayUsers.filter(user => user !== newWinner);
        await dbGiveaway.set(`${guildId}.users`, updatedUsers);

        await interaction.reply({
          content: "O sorteio foi refeito com um novo vencedor.",
          ephemeral: true
        });

        break;

      };
      case "ver-sorteios": {
        const giveaways = await dbGiveaway.all();
        if (giveaways.length === 0) {
          await interaction.reply({
            content: "Não há sorteios registrados neste servidor.",
            ephemeral: true
          });
          return;
        };
      
        let message = "Sorteios registrados neste servidor:\n";
        giveaways.forEach((giveaway, index) => {
          message += `\n**Sorteio ${index + 1}:**\n`;
          message += `Nome: ${giveaway.data.nome || "Não configurado"}\n`;
          message += `Cargo: ${giveaway.data.role || "Não configurado"}\n`;
          message += `Prêmio: ${giveaway.data.premio || "Não configurado"}\n\n`;
        });
      
        await interaction.reply({
          content: message,
          ephemeral: true
        });
      
        break;
      };
      
    };
  },
};