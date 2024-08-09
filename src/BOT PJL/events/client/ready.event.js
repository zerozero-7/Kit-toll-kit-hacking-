const { ActivityType } = require("discord.js");
const axios = require("axios");
const chalk = require('chalk');

module.exports = {
    name: 'ready',
    once: true,

    async execute(client) {
        
        console.clear()
        console.log(`${chalk.greenBright(`[SYSTEM]`)} ${chalk.blueBright(`${client.user.tag}`)} ${chalk.blackBright(`Está online.`)}`);
        console.log(`${chalk.greenBright(`[SYSTEM]`)} ${chalk.blueBright(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=8`)}`)
        console.log(`${chalk.greenBright(`[BANCO DE DADOS]`)} ${chalk.blueBright(`Wio.db`)} ${chalk.blackBright(`DataBase conectada com sucesso.`)}`);

        const textStatus = `no PJL Tatics`
        client.user.setActivity(textStatus, {
            type: ActivityType.Playing
        });
        client.user.setStatus("online");

        const description = `Ola, eu sou um bot unico e exclusivamente programado para o PJL Tatics e faço parte do PJL Group!`
        await axios.patch(`https://discord.com/api/v10/applications/${client.user.id}`, {
            description: description
        }, {
            headers: {
                "Authorization": `Bot ${process.env.TOKEN}`,
                "Content-Type": 'application/json',
            }
        });
        
    },
};