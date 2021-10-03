const Discord = require("discord.js")
const client = new Discord.Client()
const refreshBot = require("./server")
var eventHandler = require('./src/EventHandler')


eventHandler(client);
refreshBot();
client.login(process.env.TOKEN)