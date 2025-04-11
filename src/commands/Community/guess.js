const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

const astroImages = require("../../../astroImages.json");
const activeGames = new Map();
const User = require("../../schemas/streakSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guess")
    .setDescription("Start an astro guessing game!")
    .addSubcommand((subcommand) =>
      subcommand.setName("easy").setDescription("Start an easy game")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("medium").setDescription("Start a medium game")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("hard").setDescription("Start a hard game")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("extreme").setDescription("Start a very hard game")
    ),

  async execute(interaction) {
    const difficulty = interaction.options.getSubcommand();
    const channelId = interaction.channel.id;

    if (activeGames.has(channelId)) {
      return interaction.reply({
        content: `⚠️ A game of **${activeGames.get(channelId).toUpperCase()}** difficulty is already active in this channel. Please wait for it to finish.`,
        ephemeral: true,
      });
    }

    if (!astroImages[difficulty] || astroImages[difficulty].length === 0) {
      return interaction.reply({
        content: "No images available for this difficulty.",
        ephemeral: true,
      });
    }

    await interaction.reply({ content: `Game started!`, ephemeral: true });
    activeGames.set(channelId, difficulty);

    await startGame(interaction.channel, difficulty);
  },
};

const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/gi, "");

async function updateStreak(userId, difficulty) {
  const user = await User.findOneAndUpdate(
    { userId },
    {},
    { upsert: true, new: true }
  );

  user.correctCounter ??= {};
  user.streak ??= {};
  user.failureCounter ??= {};

  user.correctCounter[difficulty] ??= 0;
  user.streak[difficulty] ??= 0;
  user.failureCounter[difficulty] = 0;

  user.correctCounter[difficulty] += 1;

  if (user.correctCounter[difficulty] >= 3) {
    user.streak[difficulty] += 1;
  }

  await user.save();

  return {
    currentStreak: user.correctCounter[difficulty] >= 3 ? user.streak[difficulty] : 0,
    isOnStreak: user.correctCounter[difficulty] >= 3,
  };
}

async function handleWrongGuess(userId, difficulty) {
  const user = await User.findOneAndUpdate(
    { userId },
    {},
    { upsert: true, new: true }
  );

  user.correctCounter ??= {};
  user.streak ??= {};
  user.failureCounter ??= {};

  user.correctCounter[difficulty] ??= 0;
  user.streak[difficulty] ??= 0;
  user.failureCounter[difficulty] ??= 0;

  user.failureCounter[difficulty] += 1;

  if (user.failureCounter[difficulty] >= 3) {
    user.correctCounter[difficulty] = 0;
    user.streak[difficulty] = 0;
    user.failureCounter[difficulty] = 0;
  }

  await user.save();
}

async function startGame(channel, difficulty) {
  const images = astroImages[difficulty];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  const embed = new EmbedBuilder()
    .setColor("Blurple")
    .setTitle("🌌 Guess the Astronomical Object!")
    .setDescription(`Difficulty: **${difficulty.toUpperCase()}**\nType the correct name in chat!`)
    .setImage(randomImage.image)
    .setFooter({
      text: "Tip: Include the correct object designation like 'NGC 1234' or 'Messier 45'.",
    });

  const gameMessage = await channel.send({ embeds: [embed] });

  const messageCollector = channel.createMessageCollector({
    filter: (m) => !m.author.bot,
    time: 20000,
  });

  const alreadyAnswered = new Set();
  const attemptedUsers = new Set();
  let gameEnded = false;

  messageCollector.on("collect", async (m) => {
    if (gameEnded || alreadyAnswered.has(m.author.id)) return;

    attemptedUsers.add(m.author.id);
    const guess = normalize(m.content.trim()); /

    if (
      Array.isArray(randomImage.names) &&
      randomImage.names.some((name) => normalize(name) === guess) 
    ) {
      gameEnded = true;
      alreadyAnswered.add(m.author.id);

      const { currentStreak, isOnStreak } = await updateStreak(m.author.id, difficulty);

   
      const streakText =
        currentStreak === 0
          ? `🔥 **${m.author.username}** is building up a streak... (0 so far)`
          : currentStreak <= 2
          ? `🔥 **${m.author.username}** is building up a streak... (Current streak: **${currentStreak}**)`
          : `🔥 **${m.author.username}** is on a streak! Current streak: **${currentStreak}**`;

      const correctEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Correct! 🎉")
        .setDescription(
          `**${m.author.username}** guessed it first! The object is: **${randomImage.names[0]}**.\n\n${streakText}\n\nYou can either run a new game or press play again for another round.`
        )
        .setImage(randomImage.image)
        .setFooter({ text: `The answer is: ${randomImage.names[0]}` });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`play_again_${difficulty}`)
          .setLabel("Play Again")
          .setStyle(ButtonStyle.Success)
      );

      await m.react("✅");
      await channel.send({ embeds: [correctEmbed], components: [row] });

      messageCollector.stop("guessed");
    } else {
      await handleWrongGuess(m.author.id, difficulty);
    }
  });

  messageCollector.on("end", async (_collected, reason) => {
    if (!gameEnded) {
      const timeoutEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Time's up! ⏳")
        .setDescription(`The time to answer has expired.\n\nThe correct answer was: **${randomImage.names[0]}**.`);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`play_again_${difficulty}`)
          .setLabel("Play Again")
          .setStyle(ButtonStyle.Danger)
      );

      const timeoutMessage = await channel.send({
        embeds: [timeoutEmbed],
        components: [row],
      });

      for (const userId of attemptedUsers) {
        await handleWrongGuess(userId, difficulty);
      }

      setTimeout(() => {
        const editedEmbed = EmbedBuilder.from(timeoutEmbed).setDescription(
          "The time to answer has expired."
        );
        timeoutMessage.edit({ embeds: [editedEmbed] }).catch(() => {});
      }, 10000);
    }

    // CLEANUP BEFORE BUTTON COLLECTOR
    activeGames.delete(channel.id);

    const buttonCollector = channel.createMessageComponentCollector({
      filter: (i) =>
        i.customId === `play_again_${difficulty}` &&
        !activeGames.has(i.channel.id),
      time: 60000,
      max: 1,
    });

    buttonCollector.on("collect", async (i) => {
      try {
        await i.deferUpdate();

        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(i.customId)
            .setLabel("Play Again")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );

        await i.message.edit({ components: [disabledRow] });

        activeGames.set(i.channel.id, difficulty);
        await startGame(i.channel, difficulty);
      } catch (err) {
        console.error("Play again button error:", err);
        await i.followUp({
          content: "❌ Something went wrong trying to start the new game.",
          ephemeral: true,
        });
      }
    });

    buttonCollector.on("end", (_c, r) => {
      if (r === "time" && !activeGames.has(channel.id)) {
        activeGames.delete(channel.id);
      }
    });
  });
}
