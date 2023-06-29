const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "destek-ayarla",
    description: 'Botun destek sistemini ayarlarsın.',
    type: 1,
    options: [
        {
            name: "yetkili-rol",
            description: "Destek sistemindeki yetkili rolü.",
            required: true,
            type: 8
        },
        {
            name: "kanal",
            description: "Destek sistemininin kurulacağı kanal.",
            required: true,
            type: 7,
            channel_types: [0]
        },
        {
            name: "embedmesaj",
            description: "Destek sistemindeki embeddaki yazı.",
            required: true,
            type: 3
        },
        {
            name: "butonmesaj",
            description: "Destek sistemindeki butondaki yazı.",
            required: true,
            type: 3
        }
    ],
    run: async (client, interaction) => {

        
    const yetki = new EmbedBuilder()
    .setAuthor({ name: "Yetkin Yetmiyor", iconURL: interaction.member.displayAvatarURL() })
    .setDescription(`Bu komutu kullanabilmek için \`Yönetici\` yetkisine sahip olman gerekiyor.`)

        if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetki] })

        const rol = interaction.options.getRole("yetkili-rol")
        const kanal = interaction.options.getChannel("kanal")
        const embed = interaction.options.getString("embedmesaj")
        const buton = interaction.options.getString("butonmesaj")

        db.set(`desteksistem_${interaction.guild.id}`, { rol: rol.id, kanal: kanal.id, embed: embed, buton: buton })

        const nice = new EmbedBuilder()
        .setAuthor({ name: "Başarılı", iconURL: interaction.member.displayAvatarURL() })
        .setDescription(`Yetkili rolü: ${rol}\nDestek Kanal: ${kanal}\nEmbed Yazı: \`${embed}\`\nButon Yazı: \`${buton}\` olarak ayarlandı.`)

        interaction.reply({ embeds: [nice] })
     }
}