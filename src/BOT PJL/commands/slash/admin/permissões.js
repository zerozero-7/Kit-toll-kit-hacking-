// importação: discord.js
const { ActionRowBuilder, UserSelectMenuBuilder, ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } = require("discord.js");

// importação do banco de dados.
const { dbEmojis, dbPermissions } = require("../../../../databases/index");
const { ownerID } = require("../../../../config");

// export command
module.exports = {
    name: "permissão",
    description: "[⚙️] Gerencie as permissões de acesso.",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "adicionar",
            description: "[⚙️] Adicione a permissão para algum usuario.",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "remover",
            description: "[⚙️] Remova a permissão de algum usuario.",
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: "informação",
            description: "[⚙️] Mostar todos os usuarios que tem acesso.",
            type: ApplicationCommandOptionType.Subcommand,
        }
    ],

    run: async (client, interaction) => {

        // no owner - user without owner in dbConfigs (wio.db)
        const ownerId = await ownerID;
        if (ownerId != interaction.user.id) {
            await interaction.reply({
                content: `${dbEmojis.get(`negar`)} | Você não tem permissão para usar este comando.`,
                ephemeral: true
            });
            return;
        };

        switch (interaction.options.getSubcommand()) {

            case 'adicionar': {

                // row - users (1)
                const rowUsers1 = new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder().setCustomId(`usersMenu`).setPlaceholder(`Selecione um Usuário`)
                    );

                // message - users
                await interaction.reply({
                    content: `🔐 | Selecione um usuário no menu abaixo!`,
                    components: [rowUsers1],
                    ephemeral: true
                });

                // try catch
                try {

                    // collector - awaitMessageComponent
                    const iPerm = await interaction.channel.awaitMessageComponent({ time: 120000 });

                    // usersMenu
                    if (iPerm.customId == `usersMenu`) {

                        // value/value chosen in the select menu
                        const valueSelected = iPerm.values[0];

                        // user - fetch
                        const userSelected = await client.users.fetch(valueSelected);

                        // user is already in dbPerms (wio.db)
                        const userExisting = await dbPermissions.get(userSelected.id);
                        if (userExisting) {
                            await interaction.editReply({
                                content: `${dbEmojis.get(`negar`)} | O usuário ${userSelected} já tem permissão e pode usar minhas funções.`,
                                components: [],
                                ephemeral: true
                            });
                            return;
                        };

                        // set the user in dbPerms (wio.db)
                        await dbPermissions.set(userSelected.id, userSelected.id);

                        // editReply - success
                        await interaction.editReply({
                            content: `${dbEmojis.get(`aceitar`)} | Agora o usuário ${userSelected} tem permissão para usar minhas funções.`,
                            components: [],
                            ephemeral: true
                        });

                    };

                } catch (err) {
                    return;
                };

                break;
            };

            case 'remover': {

                // row - users (1)
                const rowUsers1 = new ActionRowBuilder()
                    .addComponents(
                        new UserSelectMenuBuilder().setCustomId(`usersMenu`).setPlaceholder(`Selecione um Usuário`)
                    );

                // message - users
                await interaction.reply({
                    content: `🔐 | Selecione um usuário no menu abaixo!`,
                    components: [rowUsers1],
                    ephemeral: true
                });

                // try catch
                try {

                    // collector - awaitMessageComponent
                    const iPerm = await interaction.channel.awaitMessageComponent({ time: 120000 });

                    // usersMenu
                    if (iPerm.customId == `usersMenu`) {

                        // value/value chosen in the select menu
                        const valueSelected = iPerm.values[0];

                        // user - fetch
                        const userSelected = await client.users.fetch(valueSelected);

                        // user is already in dbPerms (wio.db)
                        const userExisting = await dbPermissions.get(userSelected.id);
                        if (!userExisting) {
                            await interaction.editReply({
                                content: `${dbEmojis.get(`negar`)} | O usuário ${userSelected} não tem permissão para usar minhas funções.`,
                                components: [],
                                ephemeral: true
                            });
                            return;
                        };

                        // set the user in dbPerms (wio.db)
                        await dbPermissions.delete(userSelected.id);

                        // editReply - success
                        await interaction.editReply({
                            content: `✅ | O usuário ${userSelected} teve suas permissões removidas.`,
                            components: [],
                            ephemeral: true
                        });

                    };

                } catch (err) {
                    return;
                };

                break;
            };

            case 'informação': {

                // variable with users
                const usersVariable = [];
                for (const userDB of dbPermissions.all()) {
                    const userId = userDB[`ID`];
                    const user = await client.users.fetch(userId);
                    if (user) {
                        usersVariable.push(`${dbEmojis.get(`comprador`)} | ${user} | ${user.username}`);
                    };
                };

                // total users - number
                const usersTotal = dbPermissions.all().length;

                // embed - users
                const embedUsers = new EmbedBuilder()
                    .setAuthor({ name: client.user.username, iconURL: client.user.avatarURL() })
                    .setTitle(`Usuários com Permissão (${usersTotal})`)
                    .setDescription(`${usersVariable.join(`\n`) || `${dbEmojis.get(`negar`)} | Nenhum usuário encontrado.`}`)
                    .setColor(`NotQuiteBlack`)

                // message - users
                await interaction.reply({
                    embeds: [embedUsers],
                    ephemeral: true
                });

            };
        };

    },
};