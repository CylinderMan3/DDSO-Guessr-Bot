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

