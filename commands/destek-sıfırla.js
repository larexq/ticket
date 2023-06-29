const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const db = require("croxydb");

module.exports = {
    name: "destek-sıfırla",
    description: 'Botun destek sistemini sıfırlarsın.',
    type: 1,
    options: [],
    run: async (client, interaction) => {

        
    const yetki = new EmbedBuilder()
    .setAuthor({ name: "Yetkin Yetmiyor", iconURL: interaction.member.displayAvatarURL() })
    .setDescription(`Bu komutu kullanabilmek için \`Yönetici\` yetkisine sahip olman gerekiyor.`)

        if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetki] })

        const sistem = db.fetch(`desteksistem_${interaction.guild.id}`)

        const zaten = new EmbedBuilder()
        .setAuthor({ name: "Hata", iconURL: interaction.member.displayAvatarURL() })
        .setDescription(`Destek sistemini zaten sunucuya kurmadığın için sıfırlayamam.`)

        if(!sistem) return interaction.reply({ embeds: [zaten] })

        if(sistem) {

            db.delete(`desteksistem_${interaction.guild.id}`)

            const nice = new EmbedBuilder()
            .setAuthor({ name: "Başarılı", iconURL: interaction.member.displayAvatarURL() })
            .setDescription(`Sunucundaki destek sistemini başarıyla sıfırladım.`)
            interaction.reply({ embeds: [nice] })
        }
     }
}