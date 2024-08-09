const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits, parseEmoji, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

module.exports = {
    name: "emoji",
    description: "gerencia o modo de emojis",
    options: [
        {
            name: "add",
            description: "Add an emoji to the server.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "emoji",
                    description: "Select the emoji you want to add to the server",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "name",
                    description: "Write the name of the emoji",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                }
            ],
        }, {
            name: "info",
            description: "View information about an emoji.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "emoji",
                    description: "Select the emoji you want to see more information about",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
            ],
        }, {
            name: "remove",
            description: "Select the emoji you want to remove",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "emoji",
                    description: "Select the emoji you want to remove from the server.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
            ]
        }
    ],
    run: async (client, interaction) => {

        switch (interaction.options.getSubcommand()) {

            case "add": {

                if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
                    return interaction.reply({ content: `Ola \`ManageEmojisAndStickers\`Voce nao tem a permissao necessaria para utilizar desse comando`, ephemeral: true, allowedMentions: { repliedUser: true } })
                }
                if (!interaction.channel.permissionsFor(interaction.user).has(PermissionFlagsBits.ManageEmojisAndStickers)) {
                    return interaction.reply({ content: `Ola \`ManageEmojisAndStickers\` Voce nao tem a permissao necessaria para utilizar desse comando`, ephemeral: true, allowedMentions: { repliedUser: true } })
                }

                let name = interaction.options.getString("name");
                const string = interaction.options.getString("emoji");

                const error_embed = new EmbedBuilder()
                    .setColor("#765cf5")
                    .setDescription("Corriga o Nome ou caracteres invalidas ou que nao pode ser usada\n> Voce usou Caracteres Indiponiveis");

                const parsed = parseEmoji(string);

                const link = `https://cdn.discordapp.com/emojis/${parsed.id}${parsed.animated ? '.gif' : '.png'}`;

                if (!name) name = parsed.name;

                interaction.guild.emojis
                    .create({ attachment: link, name: `${name}` })
                    .then((em) => {
                        interaction.reply({ 
                            content: `</emoji add:1243620058131988623>
${em} **|** ${interaction.user} Emoji Adicionado com sucesso ao Servidor`,
ephemeral: true })
                    })
                    .catch((error) => {
                        console.log(error)
                        return interaction.reply({
                            embeds: [error_embed],
                            ephemeral: true,
                        });
                    });

                break;
            } // fim do add emoji

            case "info": {

                const emote = interaction.options.getString('emoji');
                const regex = emote.replace(/^<a?:\w+:(\d+)>$/, '$1');

                const emoji = interaction.guild.emojis.cache.find((emj) => emj.id === regex);
                if (!emoji) {
                    const embed1 = new EmbedBuilder()
                        .setDescription('Please enter a valid custum emoji from this server.')
                        .setColor("#765cf5")

                    return interaction.reply({
                        embeds: [embed1],
                        ephemeral: true,
                    });
                }

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Open in the browser')
                        .setURL(`https://cdn.discordapp.com/emojis/${emoji.id}${emoji.animated ? '.gif' : '.png'}`)
                        .setStyle(ButtonStyle.Link),
                );

                const embed2 = new EmbedBuilder()
                    .setTitle(`${emoji} ${emoji.name}`)
                    .setColor("#765cf5")
                    .setThumbnail(emoji.url)
                    .addFields(
                        {
                            name: 'ID:',
                            value: `\`\`\`${emoji.id}\`\`\``,
                            inline: true,
                        },
                        {
                            name: 'Mention:',
                            value: emoji.animated ? `\`\`\`<a:${emoji.name}:${emoji.id}>\`\`\`` : `\`\`\`<:${emoji.name}:${emoji.id}>\`\`\``,
                            inline: true,
                        },
                        {
                            name: 'Creation Date:',
                            value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}:f>`,
                            inline: true,
                        },
                        {
                            name: 'Type:',
                            value: `${emoji.animated ? 'Animated Image' : 'Static Image'}`,
                            inline: false,
                        },
                    );

                interaction.reply({
                    content: `</emoji info:1243620058131988623>`,
                    embeds: [embed2],
                    components: [row],
                    ephemeral: true
                });

                break;
            } // fim do emoji info

            case "remove": {

                if (!interaction.guild.members.me.permissons.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
                    return interaction.reply({
                        content: "I need the \`ManageEmojisAndStickers\` permission to run this command.",
                        ephemeral: true,
                        allowedMentions: { repliedUser: true },
                    });
                }
                if (!interaction.channel.permissionsFor(interaction.user).has(PermissionFlagsBits.ManageEmojisAndStickers)) {
                    return interaction.reply({
                        content: "You need the \`ManageEmojisAndStickers\` permission to run this command.",
                        ephemeral: true,
                        allowedMentions: { repliedUser: true }
                    })
                }

                try {
                    const emojiQuery = interaction.options.getString("emoji")?.trim();
                    const emoji = await interaction.guild.emojis.fetch().then((emojis) => {
                        return emojis.find(
                            (x) => x.name === emojiQuery || x.toString() == emojiQuery
                        );
                    }).catch((err) => console.log(err));

                    if (!emoji) {
                        return interaction.reply({
                            content: "I could not find any information about the emoji",
                            ephemeral: true,
                            allowedMentions: { repliedUser: true }
                        })
                    }

                    emoji.delete().then(async () => {
                        await interaction.reply({
                            content: `\:wastebasket: **O emoji \`${emoji.name}\` foi removido com sucesso.**`,
                            allowedMentions: { repliedUser: true },
                            ephemeral: true
                        });
                    }).catch((err) => {
                        // Erro ao remover o emoji do servidor
                        console.log(err); // Registro no console para fins de depuração
                        interaction.reply({
                            content: "Não foi possível remover o emoji do servidor.",
                            ephemeral: true,
                            allowedMentions: { repliedUser: true },
                        });
                    });
                } catch (err) {
                    // Ocorreu um erro ao procurar o emoji e/ou a obter detalhes do mesmo
                    console.log(err); // Registro no console para fins de depuração
                    interaction.reply({
                        content: "Não foi possível obter informações do emoji inserido.",
                        ephemeral: true,
                        allowedMentions: { repliedUser: true },
                    });
                }
                break;
            }
        }
    }
}