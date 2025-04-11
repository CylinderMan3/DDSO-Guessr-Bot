const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rules")
        .setDescription("Check the game's rules"),
    
    async execute(interaction, client) {
        const rulesEmbed = new EmbedBuilder()
            .setTitle(`📜 Game Rules`)
            .setColor("Blurple")
            .setDescription("You can help expand our object database by using `/submit` to add new images and names!")
            .setFooter({ text: `Bot created by Riemann Manifold` })
            .addFields(
                {
                    name: "1. How to Name Objects:",
                    value: "• Names are not case/space-sensitive.\n" +
                           "• The names must only be contained in the message, not necessarily as the whole standalone message.\n" +
                           "(e.g. 'Orion Nebula' will be accepted even if typed as 'nebulaorion').",
                    inline: false
                },
                {
                    name: "2. Object Naming Guidelines:",
                    value: "• When naming objects, you must include ‘nebula’ or ‘galaxy’ after the object’s name for it to count (e.g., ‘Orion Nebula’).\n" +
                           "• For objects that traditionally don’t have this suffix, you may add it anyway (but it's not required).",
                    inline: false
                },
                {
                    name: "3. Accepted Designations:",
                    value: "• Only Messier, Caldwell, NGC, Barnard, and IC designations count as answers.\n" +
                           "• ‘Messier 31’, ‘M31’, ‘IC 2332’, ‘NGC 6008’, ‘Caldwell 3’, ‘C3’, ‘Barnard 15’, and ‘B15’ work.\n" +
                           "• ‘M 31’, ‘B 15’, ‘C 3’ do not work.\n" +
                           "• Typos/missing spaces will also cause the answer to be incorrect.",
                    inline: false
                },
                {
                    name: "4. Answer Matching:",
                    value: "• You can use one of the object's designation names. (For instance, typing 'NGC 1234' or 'Messier 45' works)." ,             
                    inline: false
                }
            );

        interaction.reply({ embeds: [rulesEmbed] });
    }
};
