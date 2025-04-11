const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("submit-rules")
        .setDescription("Check the submit command rules"),
    
    async execute(interaction, client) {
        const submitEmbed = new EmbedBuilder()
            .setTitle(`📩 Submit Rules`)
            .setColor("Blurple")
            .setDescription(`/submit is the main command to upload images to our Google spreadsheet.`)
            .setFooter({ text: `Bot created by Riemann Manifold` })
            .addFields(
                {
                    name: "📌 General Submission Requirements",
                    value:
                        "• The object **must not** already be in the database.\n" +
                        "• The object **must be a deep space object**: nebula, galaxy, double star, or star cluster.\n" +
                        "• Not allowed: Planets, dwarf planets, comets, asteroids, standalone stars, black holes, unnamed DSOs, planetary/artificial satellites.\n" +
                        "• The object **must be real** and include its **most common name**.\n" +
                        "• A **difficulty level (Easy, Medium, Hard, Extreme)** is **required** when using `/submit`.\n" +
                        "• Want to update an existing object? Submit again and include your suggested change (e.g., incorrect name, bad image, wrong difficulty).",
                    inline: false
                },
                
            );

        interaction.reply({ embeds: [submitEmbed] });
    }
};
