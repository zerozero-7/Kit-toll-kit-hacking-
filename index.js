const { GatewayIntentBits, Client, Collection, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel } = require("@discordjs/voice");
const { token } = require("./config");
const { dbSugestions, dbMessages } = require("./databases/index");


const fs = require("fs");
const chalk = require('chalk');
const SlashsArray = [];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent
  ],
  partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"]
});

client.login(token).catch(() => {
  console.log(`${chalk.greenBright(`[SYSTEM]`)} ${chalk.redBright(`TOKEN NÃO CONFIGURADO.`)}`);
});

client.config = require('./config');
client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();
client.categories = fs.readdirSync(`./src/commands/prefix/`);

fs.readdirSync('./src/commands/prefix/').forEach(local => {
  const comandos = fs.readdirSync(`./src/commands/prefix/${local}`).filter(arquivo => arquivo.endsWith('.js'))

  for (let file of comandos) {
    let puxar = require(`./src/commands/prefix/${local}/${file}`)

    if (puxar.name) {
      client.commands.set(puxar.name, puxar)
    }
    if (puxar.aliases && Array.isArray(puxar.aliases))
      puxar.aliases.forEach(x => client.aliases.set(x, puxar.name))
  }
});

fs.readdirSync('./src/events/').forEach(local => {
  const eventos = fs.readdirSync(`./src/events/${local}`).filter(arquivo => arquivo.endsWith('.js'))

  for (let file of eventos) {
    let events = require(`./src/events/${local}/${file}`)
    if (events.once) {
      client.once(events.name, (...args) => events.execute(client, ...args))
    } else {
      client.on(events.name, (...args) => events.execute(client, ...args))
    }
  }
});

fs.readdirSync('./src/commands/slash/').forEach(local => {
  const scomandos = fs.readdirSync(`./src/commands/slash/${local}`).filter(arquivo => arquivo.endsWith('.js'))

  for (let file of scomandos) {
    const slashcommand = require(`./src/commands/slash/${local}/${file}`)

    if (slashcommand.name) {
      client.slashCommands.set(slashcommand.name, slashcommand);
      SlashsArray.push(slashcommand)
    }
  }
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception: " + err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log(`${chalk.redBright("[ERRO DETECTADO]")}`, promise, `${chalk.redBright(reason.message)}`)
});

client.on("ready", async (client, interaction) => {

  await client.application.commands.set(SlashsArray).then(() => {
    console.log(`${chalk.greenBright(`[SLASH COMMANDS]`)} ${chalk.blackBright(`Comandos Carregados!`)}`)
    require('./src/events/public/refreshMessage.event').execute(client)
  })

  let canal = client.channels.cache.get(process.env.CONNECT);
  if (!canal) return console.log("❌ Não foi possível entrar no canal de voz.");
  if (canal.type !== ChannelType.GuildVoice) return console.log(`❌ Não foi possível entrar no canal [ ${canal.name} ].`);

  try {

    joinVoiceChannel({
      channelId: canal.id,
      guildId: canal.guild.id,
      adapterCreator: canal.guild.voiceAdapterCreator,
    });

    console.log(`${chalk.greenBright(`[CONEXÃO]`)} ${chalk.blackBright(`✅ Entrei no canal`)} ${chalk.blueBright(`[ ${canal.name} ]`)} ${chalk.blackBright(`com sucesso.`)}`)

  } catch (e) {

    console.log(`${chalk.greenBright(`[CONEXÃO]`)} ${chalk.redBright(`❌ Não foi possivel entrar no canal [ ${canal.name} ].`)}`);

  };

});

client.on('messageCreate', async message => {
  if (message.content) {
    const allChannels = await dbSugestions.all();
    allChannels.forEach(async allcanais => {
      const { id } = allcanais.data;
      const channelId = id;
      if (message.channel.id === channelId) {
        try {
          await message.delete();
        } catch (error) {
          console.error('Erro ao deletar mensagem', error);
        }

        const embed = new EmbedBuilder()
          .setAuthor({ name: `Sugestão de: ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
          .setDescription(`> \`\`\`${message.content}\`\`\``)
          .setThumbnail(message.author.displayAvatarURL())
          .setColor("#000041")
          .setFooter({ text: `${message.author.username}`, icon_url: `${message.author.displayAvatarURL({ format: "png" })}`, });

        const row1 = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('aceitar_sugestao')
              .setLabel(`0`)
              .setStyle(2)
              .setEmoji('1138219908610662540'),
            new ButtonBuilder()
              .setCustomId('recusar_sugestao')
              .setLabel(`0`)
              .setStyle(2)
              .setEmoji('1138219921998876682'),
            new ButtonBuilder()
              .setCustomId('mostrar_votos')
              .setLabel('Mostrar Votos')
              .setStyle(1)
          );

        const sentMessage = await message.channel.send({ embeds: [embed], components: [row1] });
        dbMessages.set(`suggest_${message.id}`, true);

        const thread = await sentMessage.startThread({
          name: `Sugestão Thread - ${message.author.username}`,
          autoArchiveDuration: 60, // sugestão será encerrada durante 60 segundos
          startMessage: message.content
        });
      }
    });
  }
});
const blockedWords = ["porn", "free content", "steam community", "🔞", "hello, i found good server", "steam community free", "50$", "https://steamcommunity/gift", "https://steamcommunity", "Onlyfans", "18 Only", "Free Onlyfans", "https://t.me"];
const telegramLinkRegex = /https?:\/\/(www\.)?t\.me\/[^\s]+/gi;
const steamLinkRegex = /https?:\/\/(www\.)?steam\community\/[^\s]+/gi;
const logChannelId = '1255265259246063777'; 

client.on('messageCreate', (message) => {
    if (message.author.bot) return; 

    const containsBlockedWords = blockedWords.some(word => message.content.toLowerCase().includes(word.toLowerCase()));
    const containsTelegramLink = telegramLinkRegex.test(message.content);
    const containsSteamLink = steamLinkRegex.test(message.content);

    if (containsBlockedWords || containsTelegramLink || containsSteamLink) {
        message.delete()
            .then(() => {
                message.channel.send(`❌ |  ${message.author} sua mensagem acabou sendo deletada por nosso sistema por conter links não apropriados para a nossa comunidade.`)
                    .then(msg => {
                        setTimeout(() => msg.delete(), 5000); 
                    });


                const logChannel = client.channels.cache.get(logChannelId);
                if (logChannel) {
                    logChannel.send(`
\`⛔\` | Mensagem deletada de \`${message.author.tag}\` no canal ${message.channel}
\`🔍\` | Conteudo Excluido: \`${message.content}\``);
                } else {
                    console.error("Canal de log não encontrado");
                }
            })
            .catch(console.error);
    }
});
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const userId = interaction.user.id;

  if (interaction.customId === 'aceitar_sugestao' || interaction.customId === 'recusar_sugestao') {
    const r = dbMessages.get(`${userId}_${interaction.message.id}`);
    const embed = new EmbedBuilder()
      .setDescription('Você já votou.')
      .setColor("#2f3136")
    if (r === 1) return interaction.reply({ embeds: [embed], ephemeral: true });

    await dbMessages.set(`${userId}_${interaction.message.id}`, 1);

    const yesVotes = await dbMessages.get(`positivo_${interaction.message.id}`) || [];
    const noVotes = await dbMessages.get(`negativo_${interaction.message.id}`) || [];

    if (interaction.customId === 'aceitar_sugestao') {
      if (!yesVotes.includes(userId)) {
        yesVotes.push(userId);
        dbMessages.set(`positivo_${interaction.message.id}`, yesVotes);
      }
    } else {
      if (!noVotes.includes(userId)) {
        noVotes.push(userId);
        dbMessages.set(`negativo_${interaction.message.id}`, noVotes);
      }
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('aceitar_sugestao')
          .setLabel(`${yesVotes.length}`)
          .setStyle(2)
          .setEmoji('1138219908610662540'),
        new ButtonBuilder()
          .setCustomId('recusar_sugestao')
          .setLabel(`${noVotes.length}`)
          .setStyle(2)
          .setEmoji('1138219921998876682'),
        new ButtonBuilder()
          .setCustomId('mostrar_votos')
          .setLabel('Mostrar Votos')
          .setStyle(1)
      );

    interaction.update({ components: [row] });
  }

  if (interaction.customId === 'mostrar_votos') {
    const yesVotes = await dbMessages.get(`positivo_${interaction.message.id}`) || [];
    const noVotes = await dbMessages.get(`negativo_${interaction.message.id}`) || [];

    const yesUsernames = yesVotes.map(userId => `<@${userId}>`).join('\n');
    const noUsernames = noVotes.map(userId => `<@${userId}>`).join('\n');

    const embed = new EmbedBuilder()
      .setColor("#2f3136")

    if (yesUsernames.length > 0) {
      embed.addFields({ name: 'Votação positiva', value: yesUsernames, inline: true });
    } else {
      embed.addFields({ name: 'Votação positiva', value: 'Sem votação', inline: true });
    }

    if (noUsernames.length > 0) {
      embed.addFields({ name: 'Votação negativa', value: noUsernames, inline: true });
    } else {
      embed.addFields({ name: 'Votação negativa', value: 'Sem votação', inline: true });
    }

    interaction.reply({ embeds: [embed], ephemeral: true });
  }

});

client.on("interactionCreate", async interaction => {
  if (interaction.isAutocomplete()) {
      const command = client.slashCommands.get(interaction.commandName)
      if (!command) {
          return;
      }
      try {
          await command.autocomplete(interaction);
      } catch (err) { return; }
  }
});

client.on('guildMemberAdd', async member => {

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
    .setURL("https://canary.discord.com/channels/1174722760900091994/1206706246279897178")
    .setEmoji("<:vydeveloperFXP:1245816620400513146> ")
    .setLabel("Leia as regras")
    .setStyle(ButtonStyle.Link),
    new ButtonBuilder()
    .setURL("https://canary.discord.com/channels/1174722760900091994/1206706237056483519")
    .setEmoji("<:waze_network:1245816344889266206> ")
    .setLabel("Venha jogar")
    .setStyle(ButtonStyle.Link),
  );
    
  const canal = member.guild.channels.cache.get("1206707956771590206")

  const saida = new EmbedBuilder()
    .setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL({ dynamic: true }) })
    .setColor(process.env.PADRAO)
    .setImage("https://cdn.discordapp.com/attachments/1240023617648070747/1245485635884814406/cena-de-guerra_777078-16937_1_copiar.png?ex=66599523&is=665843a3&hm=b0d0699bc5571d33e4a8c3f4c0b450922642036d42cd495820ff5e222ac0857f&")
    .setTitle(`${member.user.username} Entrou no servidor.`)
    .setDescription(`👋 Seja Bem vindo(a) ${member.user.username}!

    > Seja bem-vindo, chega no sapatinho que aqui é disciplina.
    
     ${member.user.tag}, Sabia que você é o ${member.guild.memberCount}º membro aqui no servidor?`)
    .setFooter({ text: `ID do usuário: ` + member.user.id })
    .setTimestamp()

  await canal.send({
    embeds: [saida],
      components: [row],
  });
});

    
