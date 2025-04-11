const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const User = require("../../schemas/streakSchema"); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetstreaks")
    .setDescription("⚠️ Deletes ALL user streaks (admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
  

    await interaction.deferReply({ ephemeral: true });

    try {
      const result = await User.deleteMany({});
      return interaction.editReply({
        content: `✅ All streak data has been reset. (${result.deletedCount} users removed)`,
      });
    } catch (err) {
      console.error("Failed to reset streaks:", err);
      return interaction.editReply({
        content: "❌ An error occurred while resetting streaks.",
      });
    }
  },
};
