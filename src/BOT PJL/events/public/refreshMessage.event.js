const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const Gamedig = require('gamedig');
const { dbEmojis } = require("./../../../databases/index");

const image = process.env.IMAGEM || "https://sem-img.com";

const PanelEmbed = ({ players, maxPlayers, online, serverName, }) => ({
    embeds: [
        new EmbedBuilder()
            .setColor(process.env.PADRAO)
            .setImage(image)
            .setDescription(`**Nome do servidor:**
            \`\`\`${serverName}\`\`\`
            **IP MTA:SA:**
            \`\`\`Entre ${process.env.IP}:${process.env.PORTA}\`\`\`
            **Players:**
            \`\`\`ini\n[ ${players}/${maxPlayers} ]\`\`\`
            **STATUS:**
            \`\`\`${online ? `${(``)} Servidor online!` : `${(``)} Servidor offline!`}\`\`\`

            `)
    ],
    components: [
        new ActionRowBuilder().addComponents(new ButtonBuilder().setURL(`${process.env.LINKCONECTAR}`).setLabel('Conectar').setEmoji(`${dbEmojis.get(`serveron`)}`).setStyle(ButtonStyle.Link)),
    ],
});

const getServerDetails = async () => {
    const result = await Gamedig.query({ type: 'mtasa', host: `${process.env.IP}`, port: `${process.env.PORTA}` }).then(state => (state)).catch(() => (null));

    if (!result) return PanelEmbed({ players: 0, maxPlayers: 0, online: false });

    return PanelEmbed({ players: result.players.length, maxPlayers: result?.maxplayers, online: true, serverName: result?.name, })
};

module.exports = {
    execute: async (client) => {
        const guild = await client.guilds.cache.get(`${process.env.SERVIDOR}`);
        const channel = await guild?.channels.cache.get(`${process.env.CANAL}`);

        if (!guild || !channel) return;

        let message
        message = await channel.send(await getServerDetails())

        setInterval(async () => {
            if (!message) {
                message = await channel.send(await getServerDetails())
                return
            }
            message.edit(await getServerDetails())
        }, (1000 * 60) * 1);
    },
};