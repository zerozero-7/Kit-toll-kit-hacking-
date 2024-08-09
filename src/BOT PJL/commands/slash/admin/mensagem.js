const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const { dbPermissions, dbEmojis } = require("./../../../../databases/index");

module.exports = {
  name: 'mensagem',
  description: `[🔧] Envie o setup de algum sistema.`,
  options: [{ name: "ticket", description: "[🔧] Envie o painel de ticket.", type: ApplicationCommandOptionType.Subcommand }],

  run: async (client, interaction) => {


    switch (interaction.options.getSubcommand()) {

      case 'ticket': {
        interaction.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('PJL Tatics')
              .setDescription('> Tste')
              .setColor("000041")
              .setImage(`https://cdn.discordapp.com/attachments/1206740158091890718/1243107906673704971/ticket.png?ex=665045f4&is=664ef474&hm=49db583274c0c19f98060803b2645d5e2d1fae91db79e36f8f29fa4b714f5b40&`)
              .setThumbnail(`https://images-ext-1.discordapp.net/external/Pq_bxIimY_fV9urpgYw-4tKX_sO6b_CUakCqSM9LyEk/https/cdn.discordapp.com/icons/1174722760900091994/a_070a1570171a590a552b447bf25880c8.gif`)
              .setFooter({ text: '© PJL Tatics - Todos os direitos reservados' })
          ],

        });

        await interaction.reply({
          content: `O painel de ticket foi enviado com sucesso para o canal atual.`,
          ephemeral: true
        });

      };

    };

  },
};