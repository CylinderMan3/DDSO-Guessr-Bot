const { SlashCommandBuilder } = require('discord.js');
const {
    disableSubmissions,
    enableSubmissions,
    isSubmissionsEnabled
} = require('../../../submissionState'); 

const allowedAdminIds = ['600363335837548564', "1080534683114295406"]; 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disable-submissions')
        .setDescription('Enable or disable the ability for users to submit images')
        .addBooleanOption(option =>
            option.setName('enabled')
                .setDescription('Set to true to enable, false to disable')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!allowedAdminIds.includes(interaction.user.id)) {
            return await interaction.reply({
                content: '🚫 You are not authorized to run this command.',
                ephemeral: true
            });
        }

        const shouldEnable = interaction.options.getBoolean('enabled');

        if (shouldEnable) {
            enableSubmissions();
            await interaction.reply({
                content: '✅ Submissions have been **enabled**.'
                
            });
        } else {
            disableSubmissions();
            await interaction.reply({
                content: '🛑 Submissions have been **disabled**.'
               
            });
        }
    }
};
