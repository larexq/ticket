const { Client, Intents } = require('discord.js');

global.client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

client.config = require('./config');

require('./src/loader');

//VOICE FILL HERE OR DELETE

const { joinVoiceChannel } = require('@discordjs/voice');
 client.on('ready', () => { 
  joinVoiceChannel({
channelId: "", //CHANNEL ID
guildId: "", //SERVER ID   
adapterCreator: client.guilds.cache.get("").voiceAdapterCreator
    });                               //SERVER ID
});

//VOICE FILL HERE OR DELETE


//bot profile photo in img file

//you just need to put the token in .env
client.login(client.config.dsc.token);