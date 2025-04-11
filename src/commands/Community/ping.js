const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if the bot is still alive"),
    async execute(interaction, client) {
        await interaction.deferReply(); 

        const pinging = await interaction.editReply({ content: "Pinging..." });

        const embed = new EmbedBuilder()
        .setColor(`Blurple`)
        .setTitle(`🏓 Ping!`)
        .setDescription(`Your ping is at a whopping **${client.ws.ping}ms!**`)

        await pinging.edit({embeds: [embed], content: "Pong!" })
    }
}