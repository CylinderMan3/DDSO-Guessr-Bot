const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection } = require(`discord.js`);
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] }); 

client.commands = new Collection();

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

const mongoose = require("mongoose")

client.on('ready', async function () {

  const mongodb = process.env.mongodb

  if (!mongodb) return;

  mongoose.set("strictQuery", false);

  await mongoose.connect(mongodb || "", {
   // keepAlive: true,
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
  });
})

client.on('ready', async () => {

  const channel = client.channels.cache.get('1358165365196193923'); // Replace with the game channel ID
  if (!channel || !channel.isTextBased()) return;

  // Try to fetch an existing webhook or create one if not found
  let webhook = (await channel.fetchWebhooks()).find(wh => wh.name === 'Carson');
  if (!webhook) {
    webhook = await channel.createWebhook({
      name: 'Carson',
      avatar: "https://cdn.discordapp.com/attachments/1063535404600528947/1360250845660450846/Screenshot_2025-04-11_131106.png?ex=67fa6fd1&is=67f91e51&hm=6466cf2f14643a6cc1eee909225472aa55f74e7feac5adfd5684033d0cdbf867&",
    });
  }


  const phrases = [
    "Is that a black hole or my social life?",
    "Someone please guess already, I’m getting sick!",
    "YOU ALL STINK RANCID",
    "I really hope someone loses their streak",
    "I hope you get one incorrect",
    "This image is easier than finding Orion’s belt on a clear night.",
    "Launching my patience into the void...",
    "Y’all better not be googling the answers.",
    "I spy with my little eye... an incorrect guess.",
    "Such ungrateful players...",
    "Yeah yeah spending 500 billion years to get 1000 streaks.. it will never be you..",
    "I need to change my pants...",
    "I HATE THIS GAME ITS SO BORING WHO MADE THIS",
  ];

  
  const sendRandomMessage = async () => {
    const chance = Math.random();
    if (chance > 0.75) { // 30% chance to say something
      const randomMessage = phrases[Math.floor(Math.random() * phrases.length)];
      await webhook.send({ content: randomMessage });
    }
  };

  // Send every 2 to 5 minutes
  setInterval(sendRandomMessage, Math.floor(Math.random() * 180000) + 120000); // 120,000ms to 300,000ms
});



process.on("uncaughtException", (err) => {
    console.log("Uncaught exception:", err);
  });
  
  process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log("Uncaught Exception Monitor:", err, origin);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
    
  });
  
  process.on('warning', (warning) => {
    console.warn('Warning:', warning);
  
    
  });
  
  client.on('rateLimit', (rateLimitInfo) => {
    console.warn('Rate Limit:', rateLimitInfo);
  
    
  });
  
  client.on('error', (error) => {
    console.error('Discord.js Error:', error);
  
   
  });

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();

