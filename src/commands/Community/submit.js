const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('submit')
        .setDescription('Submit new images to use in rounds!')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name/designation of the astro image. You can include multiple designation names.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('Select the difficulty category you think this image would represent')
                .setRequired(true)
                .addChoices(
                    { name: 'Easy', value: 'Easy' },
                    { name: 'Medium', value: 'Medium' },
                    { name: 'Hard', value: 'Hard' },
                    { name: 'Extreme', value: 'Extreme' }
                ))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Upload the astro image file')
                .setRequired(true)),

    async execute(interaction, client) {
        const imageName = interaction.options.getString('name');
        const difficulty = interaction.options.getString('difficulty');
        const imageAttachment = interaction.options.getAttachment('image');

        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(imageAttachment.contentType)) {
            return await interaction.reply({
                content: 'Please upload a valid image file (JPG, PNG, GIF, or WEBP).',
                ephemeral: true
            });
        }

        // Confirmation embed
        const embed = new EmbedBuilder()
            .setTitle('🌌 Confirm Submission')
            .setDescription(`**Name:** ${imageName}\n**Difficulty:** ${difficulty}\n**Submitted by:** ${interaction.user.tag}\n\nEnsure that you have read the submit rules by using /submit-rules before submitting an image.\nOnce you are ready, please confirm this image before it is submitted to the spreadsheet.`)
            .setImage(imageAttachment.url)
            .setColor(0x3498db);

        const successEmbed = new EmbedBuilder()
            .setTitle('✅ Submission Confirmed')
            .setDescription(`**${imageName}** (${difficulty}) has been submitted to our spreadsheet. Thank you for helping us to expand our object database.`)
            .setImage(imageAttachment.url)
            .setColor(0x3498db);

        // Buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_submission')
                .setLabel('✅ Confirm')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('cancel_submission')
                .setLabel('❌ Cancel')
                .setStyle(ButtonStyle.Danger)
        );

        const reply = await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60_000,
            filter: i => i.user.id === interaction.user.id
        });

        collector.on('collect', async i => {
            if (i.customId === 'confirm_submission') {
              
                await i.update({
                    embeds: [successEmbed],
                    components: [new ActionRowBuilder().addComponents(
                        row.components.map(button => button.setDisabled(true))
                    )]
                });

                
                try {
                    await axios.post(`https://sheetdb.io/api/v1/lpcwtlxyloqx2`, {
                        data: [
                            {
                                User: interaction.user.tag,
                                Date: new Date().toLocaleString(),
                                "Image Link": imageAttachment.url,
                                "Object Name": imageName,
                                Difficulty: difficulty
                            }
                        ]
                    });

                    const publicEmbed = new EmbedBuilder()
                        .setTitle('🌌 New Astro Image Submitted')
                        .setDescription(`**Name:** ${imageName}\n**Difficulty:** ${difficulty}\n**Submitted by:** ${interaction.user.tag}\nThis will be sent to a Google spreadsheet where we will hold and review our submissions. Any troll submissions will lead to a blacklist.`)
                        .setImage(imageAttachment.url)
                        .setTimestamp()
                        .setColor(0x8e44ad);

                    await interaction.followUp({
                        embeds: [publicEmbed],
                        ephemeral: true
                    });

                } catch (err) {
                    console.error('SheetDB Error:', err.message);
                    await interaction.followUp({
                        content: '❌ Something went wrong saving your submission.',
                        ephemeral: true
                    });
                }

                collector.stop();

            } else if (i.customId === 'cancel_submission') {
                await i.update({
                    content: 'Submission cancelled.',
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
                collector.stop();
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                await interaction.editReply({
                    content: '❌ Confirmation timed out.',
                    components: [],
                    embeds: [],
                    ephemeral: true
                });
            }
        });
    }
};
