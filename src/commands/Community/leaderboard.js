const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../schemas/streakSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Shows the top streaks per difficulty by user."),

  async execute(interaction) {
    await interaction.deferReply();

    const users = await User.find({});
    const userStreaks = users.map((user) => ({
      userId: user.userId,
      easy: user.streak?.easy || 0,
      medium: user.streak?.medium || 0,
      hard: user.streak?.hard || 0,
      extreme: user.streak?.extreme || 0,
    }));

    const difficulties = ["easy", "medium", "hard", "extreme"];
    const difficultyNames = {
      easy: "🟢 Easy",
      medium: "🟡 Medium",
      hard: "🔴 Hard",
      extreme: "🟣 Extreme",
    };

    const embeds = [];

    for (const diff of difficulties) {
      const sorted = userStreaks
        .filter((u) => u[diff] > 0)
        .sort((a, b) => b[diff] - a[diff]);

      if (sorted.length === 0) continue;

      const entries = await Promise.all(
        sorted.map(async (u, i) => {
          let username;
          try {
            const member = await interaction.client.users.fetch(u.userId);
            username = member.username.length > 20
              ? member.username.slice(0, 17) + "..."
              : member.username;
          } catch {
            username = `Unknown (${u.userId})`;
          }

          const rank = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**${i + 1}.**`;
          return `${rank} ${username} — 🔥 ${u[diff]} streak`;
        })
      );

      const MAX_FIELD_LENGTH = 1000;
      let chunk = [];
      let totalLength = 0;
      let isFirstChunk = true;

      for (const entry of entries) {
        if (totalLength + entry.length > MAX_FIELD_LENGTH) {
          embeds.push(
            new EmbedBuilder()
              .setColor("Blurple")
              .addFields({
                name: `${difficultyNames[diff]}`,
                value: chunk.join("\n"),
                inline: false,
              })
              .setFooter({
                text: "Only each user's highest streak per difficulty is shown.",
              })
              .setTimestamp()
          );
          chunk = [];
          totalLength = 0;
          isFirstChunk = false;
        }

        chunk.push(entry);
        totalLength += entry.length;
      }

      if (chunk.length > 0) {
        const embed = new EmbedBuilder()
          .setColor("Blurple")
          .addFields({
            name: `${difficultyNames[diff]}`,
            value: chunk.join("\n"),
            inline: false,
          })
          .setFooter({
            text: "Only each user's highest streak per difficulty is shown.",
          })
          .setTimestamp();

        if (embeds.length === 0) {
          embed.setTitle("🌟 Astro Guess Leaderboard");
        }

        embeds.push(embed);
      }
    }

    if (embeds.length === 0) {
      return interaction.editReply("No streaks recorded yet!");
    }

    // First batch replaces original message
    await interaction.editReply({ embeds: embeds.slice(0, 10) });

    // Send remaining embeds in followups
    for (let i = 10; i < embeds.length; i += 10) {
      await interaction.channel.send({ embeds: embeds.slice(i, i + 10) });
    }
  },
};
