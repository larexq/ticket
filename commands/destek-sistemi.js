const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "destek-sistemi",
    description: 'Botun destek sistemini açarsın.',
    type: 1,
    options: [],
    run: async (client, interaction) => {

        
    const yetki = new EmbedBuilder()
    .setAuthor({ name: "Yetkin Yetmiyor", iconURL: interaction.member.displayAvatarURL() })
    .setDescription(`Bu komutu kullanabilmek için \`Yönetici\` yetkisine sahip olman gerekiyor.`)

        if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetki] })

        const sistem = db.fetch(`desteksistem_${interaction.guild.id}`)

        const ayarlanmamis = new EmbedBuilder()
        .setAuthor({ name: "Hata", iconURL: interaction.member.displayAvatarURL() })
        .setDescription(`Destek sistemi ayarlanmamış.\nAyarlamak için: \`/destek-ayarla\``)

        if(!sistem || !sistem.rol || !sistem.kanal || !sistem.embed || !sistem.buton)
        return interaction.reply({ embeds: [ayarlanmamis] })

        const button = new ButtonBuilder()
        .setCustomId("destekbuton")
        .setLabel(sistem.buton)
        .setStyle(ButtonStyle.Secondary)

        const row = new ActionRowBuilder()
        .addComponents(button)

        const nice = new EmbedBuilder()
        .setAuthor({ name: "Destek Sistemi", iconURL: interaction.guild.iconURL() })
        .setDescription(sistem.embed)
        .setThumbnail(interaction.guild.iconURL())

        interaction.reply({ content: "Destek sistemi kuruldu.", ephemeral: true })
        interaction.guild.channels.cache.get(sistem.kanal).send({ embeds: [nice], components: [row] })
     }
}