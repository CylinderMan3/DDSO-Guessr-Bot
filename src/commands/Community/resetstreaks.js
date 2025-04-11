const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const User = require("../../schemas/streakSchema"); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetstreaks")
    .setDescription("⚠️ Deletes ALL user streaks (admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Only allow admins to use this
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        content: "❌ You do not have permission to use this command.",
        ephemeral: true,
      });
    }

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
