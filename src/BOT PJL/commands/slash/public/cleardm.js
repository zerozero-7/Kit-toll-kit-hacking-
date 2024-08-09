const Discord = require("discord.js");

module.exports = {
    name: "cleardm",
    description: `[🔧] Limpe Minha DM (Max: 100 mensagens)`,
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {

        const DM = await interaction.user.createDM();

        const lastMessage = await DM.messages.fetch({ limit: 1 });
        if (lastMessage.size == 0) {
            await interaction.reply({
                content: `❌ | Não encontrei nenhuma mensagem em minha DM.`,
                ephemeral: true
            });
            return;
        };

        await interaction.reply({
            content: `🔃 | Limpando minha DM! Aguarde ...`,
            ephemeral: true
        });

        const messagesToDelete = await DM.messages.fetch({ limit: 100 });

        let deletedCount = 0;
        for (const message of messagesToDelete.values()) {

            if (message.author.bot) {
                await message.delete().catch(console.error);
                deletedCount++;
            };

            await interaction.editReply({
                content: `🔃 | **${deletedCount}** mensagens apagadas ...`,
                ephemeral: true
            });

        };

        await interaction.editReply({
            content: `✅ | Foram excluídas **${deletedCount}** mensagens em minha DM.`,
            ephemeral: true
        });

    }
}