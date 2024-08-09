const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const { dbPermissions, dbEmojis } = require("./../../../../databases/index");

module.exports = {
  name: 'setup',
  description: `[🔧] Envie o setup de algum sistema.`,
  options: [{ name: "ticket", description: "[🔧] Envie o painel de ticket.", type: ApplicationCommandOptionType.Subcommand }],

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

      case 'ticket': {

        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('selectTicket')
            .setPlaceholder('Nenhuma aba foi selecionada.')
            .addOptions([
              {
                label: 'Realizar uma compra',
                emoji: '<:banknote1:1239828639785160734>',
                description: 'Selecione para fazer alguma compra.',
                value: 'compraTicket',
              },
              {
                label: 'Falar com o suporte',
                emoji: ' <:headset:1239827225575030804>',
                description: 'Entre em contanto com algum staff.',
                value: 'suporteTicket',
              },
              {
                label: 'Fazer uma denúncia',
                emoji: '<:utilitybanhammer:1238971276261855333>',
                description: 'Faça uma denuncia atravez dessa função.',
                value: 'denunciaTicket',
              },
              {
                label: 'Reportar Bug',
                emoji: '<:promodesconto_tdc:1240080548269920267>',
                description: 'Reporte algum bug para a nossa equipe.',
                value: 'bugsTicket',
              },
              {
                label: 'Tirar dúvidas',
                emoji: '<:promoproduto_tdc:1206626099040096276>',
                description: 'Tire alguma duvida.',
                value: 'duvidasTicket',
              },
              {
                label: 'Seja parcerio',
                emoji: '🤝',
                description: 'Seja parceiro do nosso servidor.',
                value: 'Sejaparceiro',
              },
              {
                label: 'Recrutamento staff',
                emoji: '🛠️',
                description: 'Entre para a nossa equipe.',
                value: 'Sejastaff',
              },
            ]),
        );

        interaction.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('PJL Tatics')
              .setDescription('> Está precisando de ajuda relacionada ao nosso servidor? abra um ticket! assim poderemos te ajudar!')
              .setColor("000041")
              .setImage(`https://cdn.discordapp.com/attachments/1206740158091890718/1243107906673704971/ticket.png?ex=665045f4&is=664ef474&hm=49db583274c0c19f98060803b2645d5e2d1fae91db79e36f8f29fa4b714f5b40&`)
              .setThumbnail(`https://images-ext-1.discordapp.net/external/Pq_bxIimY_fV9urpgYw-4tKX_sO6b_CUakCqSM9LyEk/https/cdn.discordapp.com/icons/1174722760900091994/a_070a1570171a590a552b447bf25880c8.gif`)
              .setFooter({ text: '© PJL Tatics - Todos os direitos reservados' })
          ],
          components: [row]
        });

        await interaction.reply({
          content: `O painel de ticket foi enviado com sucesso para o canal atual.`,
          ephemeral: true
        });

      };

    };

  },
};