const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, RoleSelectMenuBuilder, StringSelectMenuBuilder, ChannelType, EmbedBuilder, PermissionFlagsBits, SelectMenuBuilder } = require("discord.js");
const { dbGiveaway, dbEmojis, } = require("./../../../databases/index");

module.exports = {
    name: "interactionCreate",

    async execute(client, interaction) {

        if (interaction.isButton()) {

            if (interaction.customId === "idGiveaway") {

                const modal = new ModalBuilder()
                    .setCustomId(`idGiv`)
                    .setTitle(`${interaction.guild.name} - ID`)

                const id = new TextInputBuilder()
                    .setCustomId(`idGivModal`)
                    .setLabel(`QUAL SERA O NOVO ID ?`)
                    .setPlaceholder(`Digite aqui o novo ID.`)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)

                const iModalGiv = new ActionRowBuilder()
                    .addComponents(id);

                await modal.addComponents(iModalGiv);

                await interaction.showModal(modal);

            };
            if (interaction.customId === "nomeGiveaway") {

                const modal = new ModalBuilder()
                    .setCustomId(`nomeGiv`)
                    .setTitle(`${interaction.guild.name} - NOME`)

                const nome = new TextInputBuilder()
                    .setCustomId(`nomeGivModal`)
                    .setLabel(`QUAL SERA O NOME DO SORTEIO ?`)
                    .setPlaceholder(`Digite aqui o novo NOME.`)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)

                const iModalGiv = new ActionRowBuilder()
                    .addComponents(nome);

                await modal.addComponents(iModalGiv);

                await interaction.showModal(modal);

            };
            if (interaction.customId === "roleGiveaway") {

                const rowCargos = new ActionRowBuilder()
                    .addComponents(
                        new RoleSelectMenuBuilder().setCustomId('rolesMenu').setPlaceholder('Selecione um Cargo')
                    );

                await interaction.update({
                    content: `🗂️ | Selecione um cargo no menu abaixo!`,
                    components: [rowCargos],
                    ephemeral: true
                });

                try {
                    const iRole = await interaction.channel.awaitMessageComponent({ time: 120000 });

                    if (iRole.customId === 'rolesMenu') {

                        await iRole.deferUpdate();

                        const valueSelected = iRole.values[0];

                        await dbGiveaway.set(`${interaction.guild.id}.role`, valueSelected);

                        const id = await dbGiveaway.get(`${interaction.guild.id}.id`);
                        const nome = await dbGiveaway.get(`${interaction.guild.id}.nome`);
                        const roleCustomer = await dbGiveaway.get(`${interaction.guild.id}.role`);
                        const roleCustomerFormatted = roleCustomer != "none" ? interaction.guild.roles.cache.get(roleCustomer) || `\`${roleCustomer} não encontrado.\`` : `\`Não configurado.\``;
                        const premio = await dbGiveaway.get(`${interaction.guild.id}.premio`);

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

                        interaction.editReply({
                            content: `# **Gerenciador de Sorteios**\nGerencie as novas configurações do sorteio pelos botões abaixo.\n${dbEmojis.get(`idgiv`)} ID: ${id != `null` ? `${id}` : `Não configurado.`}\n${dbEmojis.get(`namegiv`)} Nome: ${nome != `null` ? `${nome}` : `Não configurado.`}\n${dbEmojis.get(`rolegiv`)} Cargo: ${roleCustomerFormatted}\n${dbEmojis.get(`premiogiv`)} Premio: ${premio != `null` ? `${premio}` : `Não configurado.`}`,
                            components: [rowGiveaway],
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

            };
            if (interaction.customId === "premioGiveaway") {

                const modal = new ModalBuilder()
                    .setCustomId(`premioGiv`)
                    .setTitle(`${interaction.guild.name} - PREMIO`)

                const premio = new TextInputBuilder()
                    .setCustomId(`premioGivModal`)
                    .setLabel(`QUAL SERA O PREMIO DO SORTEIO ?`)
                    .setPlaceholder(`Digite aqui o novo PREMIO.`)
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)

                const iModalGiv = new ActionRowBuilder()
                    .addComponents(premio);

                await modal.addComponents(iModalGiv);

                await interaction.showModal(modal);

            };
            if (interaction.customId === "sendingGiveaway") {

                interaction.reply({
                    content: `Utilize o comando \`/sorteio setup\` para enviar o painel do sorteio.`,
                    ephemeral: true
                });

            };
            if (interaction.customId === "excluir") {

                await interaction.reply({
                    embeds: [
                      new EmbedBuilder()
                        .setColor(process.env.PADRAO)
                        .setDescription(`${dbEmojis.get(`atualizar`)} | Olá usuário ${interaction.user}, esse ticket sera apagado em 10 segundos...`)
                    ],
                    components: [],
                    ephemeral: true
                  });

                setTimeout(() => {
                    try {
                        interaction.channel.delete()
                    } catch (e) {
                        return;
                    }
                }, 10000);

            };

        } else if (interaction.isModalSubmit()) {

            if (interaction.customId === "idGiv") {

                const idModal = interaction.fields.getTextInputValue(`idGivModal`);

                await dbGiveaway.set(`${interaction.guild.id}.id`, idModal);

                const id = await dbGiveaway.get(`${interaction.guild.id}.id`)
                const nome = await dbGiveaway.get(`${interaction.guild.id}.nome`)
                const roleCustomer = await dbGiveaway.get(`${interaction.guild.id}.role`);
                const roleCustomerFormatted = roleCustomer != "null" ? interaction.guild.roles.cache.get(roleCustomer) || `\`${roleCustomer} não encontrado.\`` : `\`Não configurado.\``;
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

                interaction.update({
                    content: `# **Gerenciador de Sorteios**\nGerencie as novas configurações do sorteio pelos botões abaixo.\n${dbEmojis.get(`idgiv`)} ID: ${id != `null` ? `${id}` : `Não configurado.`}\n${dbEmojis.get(`namegiv`)} Nome: ${nome != `null` ? `${nome}` : `Não configurado.`}\n${dbEmojis.get(`rolegiv`)} Cargo: ${roleCustomerFormatted}\n${dbEmojis.get(`premiogiv`)} Premio: ${premio != `null` ? `${premio}` : `Não configurado.`}`,
                    components: [rowGiveaway],
                    ephemeral: true
                });

            };
            if (interaction.customId === "nomeGiv") {

                const nomeModal = interaction.fields.getTextInputValue(`nomeGivModal`);

                await dbGiveaway.set(`${interaction.guild.id}.nome`, nomeModal);

                const id = await dbGiveaway.get(`${interaction.guild.id}.id`)
                const nome = await dbGiveaway.get(`${interaction.guild.id}.nome`)
                const roleCustomer = await dbGiveaway.get(`${interaction.guild.id}.role`);
                const roleCustomerFormatted = roleCustomer != "none" ? interaction.guild.roles.cache.get(roleCustomer) || `\`${roleCustomer} não encontrado.\`` : `\`Não configurado.\``;
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

                interaction.update({
                    content: `# **Gerenciador de Sorteios**\nGerencie as novas configurações do sorteio pelos botões abaixo.\n${dbEmojis.get(`idgiv`)} ID: ${id != `null` ? `${id}` : `Não configurado.`}\n${dbEmojis.get(`namegiv`)} Nome: ${nome != `null` ? `${nome}` : `Não configurado.`}\n${dbEmojis.get(`rolegiv`)} Cargo: ${roleCustomerFormatted}\n${dbEmojis.get(`premiogiv`)} Premio: ${premio != `null` ? `${premio}` : `Não configurado.`}`,
                    components: [rowGiveaway],
                    ephemeral: true
                });

            };
            if (interaction.customId === "premioGiv") {

                const premioModal = interaction.fields.getTextInputValue(`premioGivModal`);

                await dbGiveaway.set(`${interaction.guild.id}.premio`, premioModal);

                const id = await dbGiveaway.get(`${interaction.guild.id}.id`)
                const nome = await dbGiveaway.get(`${interaction.guild.id}.nome`)
                const roleCustomer = await dbGiveaway.get(`${interaction.guild.id}.role`);
                const roleCustomerFormatted = roleCustomer != "none" ? interaction.guild.roles.cache.get(roleCustomer) || `\`${roleCustomer} não encontrado.\`` : `\`Não configurado.\``;
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

                interaction.update({
                    content: `# **Gerenciador de Sorteios**\nGerencie as novas configurações do sorteio pelos botões abaixo.\n${dbEmojis.get(`idgiv`)} ID: ${id != `null` ? `${id}` : `Não configurado.`}\n${dbEmojis.get(`namegiv`)} Nome: ${nome != `null` ? `${nome}` : `Não configurado.`}\n${dbEmojis.get(`rolegiv`)} Cargo: ${roleCustomerFormatted}\n${dbEmojis.get(`premiogiv`)} Premio: ${premio != `null` ? `${premio}` : `Não configurado.`}`,
                    components: [rowGiveaway],
                    ephemeral: true
                });

            };

        } else if (interaction.isStringSelectMenu()) {

            if (interaction.customId === "selectTicket") {

                const parentTicket = "1258216259443490868";
                const roleStaff = interaction.guild.roles.cache.get('1258216258373947407');

                const opc = interaction.values[0]
                if (opc === "compraTicket") {

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`excluir`)
                            .setEmoji(`${dbEmojis.get(`lixo`)}`)
                            .setLabel(`Excluir Ticket`)
                            .setStyle(ButtonStyle.Danger)
                    );

                    interaction.guild.channels.create({
                        name: `💸・Compra ${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        parent: `${parentTicket}`,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: roleStaff,
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    }).then((c) => {
                        const partenariat = new EmbedBuilder()
                            .setTitle('Compras | PJL War')
                            .setDescription('Qual produto você tem interesse em comprar ?')
                        c.send({ embeds: [partenariat], content: `${roleStaff} | ${interaction.user}`, components: [row] })
                        interaction.reply({ content: `✅ Seu ticket foi aberto com sucesso. <#${c.id}>`, ephemeral: true })
                    });

                };
                if (opc === "suporteTicket") {

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`excluir`)
                            .setEmoji(`${dbEmojis.get(`lixo`)}`)
                            .setLabel(`Excluir Ticket`)
                            .setStyle(ButtonStyle.Danger)
                    );

                    interaction.guild.channels.create({
                        name: `📞・Suporte ${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        parent: `${parentTicket}`,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: roleStaff,
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    }).then((c) => {
                        const plainte = new EmbedBuilder()
                            .setTitle('Suporte | PJL War')
                            .setDescription('Por favor, fale seu problema para que o suporte possa te ajudar ')
                        c.send({ embeds: [plainte], content: `${roleStaff} | ${interaction.user}`, components: [row] })
                        interaction.reply({ content: `✅ Seu ticket foi aberto com sucesso. <#${c.id}>`, ephemeral: true })
                    });

                };
                if (opc === "denunciaTicket") {

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`excluir`)
                            .setEmoji(`${dbEmojis.get(`lixo`)}`)
                            .setLabel(`Excluir Ticket`)
                            .setStyle(ButtonStyle.Danger)
                    );

                    interaction.guild.channels.create({
                        name: `🚨・Denuncia de ${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        parent: `${parentTicket}`,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: roleStaff,
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    }).then((c) => {
                        const embed = new EmbedBuilder()
                            .setTitle('Denuncia | PJL War')
                            .setDescription('Por favor, fale oque ocorreu, explique os detalhes e seja verdadeiro com a equipe, mande o id do denunciado e as provas.')
                        c.send({ embeds: [embed], content: `${roleStaff} | ${interaction.user}`, components: [row] })
                        interaction.reply({ content: `✅ Seu ticket foi aberto com sucesso. <#${c.id}>`, ephemeral: true })
                    });

                };
                if (opc === "bugsTicket") {

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`excluir`)
                            .setEmoji(`${dbEmojis.get(`lixo`)}`)
                            .setLabel(`Excluir Ticket`)
                            .setStyle(ButtonStyle.Danger)
                    );

                    interaction.guild.channels.create({
                        name: `🐛・Bug de ${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        parent: `${parentTicket}`,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: roleStaff,
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    }).then((c) => {
                        const embed = new EmbedBuilder()
                            .setTitle('Bugs | PJL War')
                            .setDescription('Por favor, fale o seu bug para o suporte te ajudar.')

                        c.send({ embeds: [embed], content: `${roleStaff} | ${interaction.user}`, components: [row] })
                        interaction.reply({ content: `✅ Seu ticket foi aberto com sucesso. <#${c.id}>`, ephemeral: true })
                    });

                };
                if (opc === "duvidasTicket") {

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`excluir`)
                            .setEmoji(`${dbEmojis.get(`lixo`)}`)
                            .setLabel(`Excluir Ticket`)
                            .setStyle(ButtonStyle.Danger)
                    );

                    interaction.guild.channels.create({
                        name: `❓・Duvida de ${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        parent: `${parentTicket}`,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: roleStaff,
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    }).then((c) => {
                        const embed = new EmbedBuilder()
                            .setTitle('Duvida | PJL War')
                            .setDescription('Por favor, fale a sua duvida, seja direto e rapido, aguarde que algum membro da nossa equipe ira lhe responder')
                        c.send({ embeds: [embed], content: `${roleStaff} | ${interaction.user}`, components: [row] })
                        interaction.reply({ content: `✅ Seu ticket foi aberto com sucesso. <#${c.id}>`, ephemeral: true })
                                            });

                };
                if (opc === "Sejaparceiro") {

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`excluir`)
                            .setEmoji(`${dbEmojis.get(`lixo`)}`)
                            .setLabel(`Excluir Ticket`)
                            .setStyle(ButtonStyle.Danger)
                    );

                    interaction.guild.channels.create({
                        name: `🤝・Parceria com ${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        parent: `${parentTicket}`,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: roleStaff,
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    }).then((c) => {
                        const embed = new EmbedBuilder()
                            .setTitle('Parcerias | PJL War')
                            .setDescription('Por favor, mande o servidor no qual deseja fechar parceria no privado do <@1054187740947820605> e aguarde ele responder.')
                        c.send({ embeds: [embed], content: `${roleStaff} | ${interaction.user}`, components: [row] })
                        interaction.reply({ content: `✅ Seu ticket foi aberto com sucesso. <#${c.id}>`, ephemeral: true })
                        
                    });

                };
                if (opc === "Sejastaff") {

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`excluir`)
                            .setEmoji(`${dbEmojis.get(`lixo`)}`)
                            .setLabel(`Excluir Ticket`)
                            .setStyle(ButtonStyle.Danger)
                    );

                    interaction.guild.channels.create({
                        name: `🛠️・Recrutamento com ${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        parent: `${parentTicket}`,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: roleStaff,
                                allow: [PermissionFlagsBits.ViewChannel]
                            }
                        ]
                    }).then((c) => {
                        const embed = new EmbedBuilder()
                            .setTitle('Recrutamento staff | PJL War')
                            .setDescription('Responda ao questionario abaixo e aguarde algum superior responder. <@1054187740947820605>\n\n- Qual a sua idade?\n- Porque voce quer ser staff?\n- Qual a diferenca que voce vai fazer na nossa equipe?\n- Onde nos conheceu?\n- Qual o seu id?\n- Qual a sua conta?\n- Qual horario voce esta disponivel?\n- Indique seus defeitos\n- Indique suas qualidades\n- Qual o significado de maturidade?\n- Ja foi banido ou punido no nosso servidor? e qual motivo?\n- Voce aceitar os nossos termos?\nSaiba que ao entrar na equipe staff voce entra em uma empresa, em caso de zaralho no nosso servidor esta sujeito a um processo judicial.')
                        c.send({ embeds: [embed], content: `${roleStaff} | ${interaction.user}`, components: [row] })
                        interaction.reply({ content: `✅ Seu ticket foi aberto com sucesso. <#${c.id}>`, ephemeral: true })
                    });
                };

            };

        };

    },
};