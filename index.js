const { PermissionsBitField, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder, AuditLogEvent } = require("discord.js");
const Discord = require("discord.js");
const fs = require("fs")

const client = new Client({
    intents: Object.values(Discord.IntentsBitField.Flags),
    partials: Object.values(Partials)
});

const PARTIALS = Object.values(Partials);
const db = require("croxydb");
const config = require("./config.json");
const chalk = require("chalk");

global.client = client;
client.commands = (global.commands = []);
const { readdirSync } = require("fs");
const interactionCreate = require("./events/interactionCreate");
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: false,
        type: 1
    });

    console.log(chalk.red`[COMMAND]` + ` ${props.name} komutu yüklendi.`)

});

readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(chalk.blue`[EVENT]` + ` ${name} eventi yüklendi.`)
});

client.login(config.token)

client.on("interactionCreate", async (interaction) => {

    const sistem = db.fetch(`desteksistem_${interaction.guild.id}`)

    if(interaction.customId === "destekbuton") {
        if(!sistem || !sistem.rol || !sistem.kanal || !sistem.embed || !sistem.buton) return;

        const text = new TextInputBuilder()
        .setCustomId("sebep")
        .setLabel("Ticket Açma Sebebiniz Nedir?")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Sebebini buraya gir..")
        .setRequired(true)

        const textrow = new ActionRowBuilder()
        .addComponents(text)

        const modal = new ModalBuilder()
        .setCustomId("sebepform")
        .setTitle("Ticket Açma Sebebin?")

        modal.addComponents(textrow)

        await interaction.showModal(modal)
    }
})

client.on("interactionCreate", async (interaction) => {

    if(!interaction.isModalSubmit()) return;
    if(interaction.customId === "sebepform") {

        const sebep = interaction.fields.getTextInputValue("sebep")

        const data = db.get(`desteksıra_${interaction.guild.id}`) || "1"

        const sistem = db.fetch(`desteksistem_${interaction.guild.id}`)

        interaction.guild.channels.create({
            name: `destek-${data}`,
            type: Discord.ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [Discord.PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: sistem.rol,
                    allow: [Discord.PermissionsBitField.Flags.ViewChannel]
                },
            ]
        }).then(channel => {

                interaction.reply({ content: `Destek Talebin Oluşturuldu. ${channel}`, ephemeral: true })

                const embed = new EmbedBuilder()
                .setAuthor({ name: `Destek Sistemi`, iconURL: interaction.guild.iconURL() })
                .setDescription(`${interaction.user} destek talebin açıldı, lütfen yetkilileri bekle.`)
                .addFields(
                    { name: "Kullanıcı", value: `${interaction.user.username} (${interaction.user.id})`, inline: true },
                    { name: "Sebep", value: `${sebep}`, inline: true },
                    { name: "Destek Sırası", value: `${data}`, inline: true },
                )

                const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("kapat")
                    .setLabel("Desteği Kapat")
                    .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                    .setCustomId("mesajlar")
                    .setLabel("Mesajlar")
                    .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                    .setCustomId("kalıcıkapat")
                    .setLabel("Kalıcı Kapat")
                    .setStyle(ButtonStyle.Danger)
                )

                db.set(`kapat_${channel.id}`, interaction.user.id)
                db.add(`desteksıra_${interaction.guild.id}`, 1)
                channel.send({ embeds: [embed], components: [row] }).then(x => x.pin())
        })
    }
})

client.on("messageCreate", async (message) => {

    if(message.channel.name.includes("destek")) {
        if(message.author?.bot) return;
        db.push(`mesaj_${message.channel.id}`, `${message.author.username}: ${message.content}`)
    }
})

client.on("interactionCreate", async (interaction) => {

    if(interaction.customId === "mesajlar") {
        const wait = require('node:timers/promises').setTimeout;
        const data = db.fetch(`mesaj_${interaction.channel.id}`)
        if(!data) {
            fs.writeFileSync(`${interaction.channel.id}.json`, `Bu Kanala Hiç Mesaj Atılmamış.`)
            interaction.reply({ files: [`./${interaction.channel.id}.json`]})
        }

        if(data) {
            fs.writeFileSync(`${interaction.channel.id}.json`, data.join("\n"))
            interaction.reply({ files: [`./${interaction.channel.id}.json`]})
        }
    }
})

client.on("interactionCreate", async (interaction) => {

    if(interaction.customId === "kapat") {
        const data = db.fetch(`kapat_${interaction.channel.id}`)

        interaction.reply({ content: `Destek talebi 5 saniye içinde kapatılacaktır.` }).then(x => setTimeout(() => interaction.channel.permissionOverwrites.edit(data, {ViewChannel: false})), 5000)
    }
})

client.on("interactionCreate", async (interaction) => {

    if(interaction.customId === "kalıcıkapat") {
        const sistem = db.fetch(`desteksistem_${interaction.guild.id}`)

        if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || !interaction.member.roles.cache.get(sistem.rol)) return interaction.reply({ content: "Bunu sen kullanamazsın.", ephemeral: true })

        interaction.reply({ content: `Destek talebi 5 saniye içinde **kalıcı olarak** kapatılacaktır.` }).then(x => setTimeout(() => interaction.channel.delete(), 5000))
    }
})

client.on("channelDelete", async (channel) => {
    const data = db.fetch(`kapat_${channel.id}`)
    const data2 = db.fetch(`mesaj_${channel.id}`)
    const x = fs.lstatSync(`./${channel.id}.json`)

    if(!data || !data2) return;

    if(data) {
        db.delete(`kapat_${channel.id}`)
    }

    if(data2) {
        db.delete(`mesaj_${channel.id}`)
    }

    if(x) {
        fs.unlinkSync(`./${channel.id}.json`)
    }
})