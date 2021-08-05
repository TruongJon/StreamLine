const Discord = require("discord.js")
const client = new Discord.Client()
const refreshBot = require("./server")

const Database = require("@replit/database")
const db = new Database()

var channel = {};
var pingrole = {};
var dadMode = {};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
})

client.on("guildCreate", guild => {

  output = ("Thanks for inviting me, use `~h` for a list of my commands.");
  if (guild.systemChannel != null) {
    guild.systemChannel.send(output);
  }
  else {
    defaultChannel = null;
    guild.channels.cache.forEach((channel) => {
    if(channel.type == "text" && defaultChannel == null) {
      if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        defaultChannel = channel;
      }
      defaultChannel.send(output);
      }
    })
  }
})

//help command
client.on("message", msg => {

  //Help command
  if (msg.content === "~help" || (msg.content === "~h")) {  
    msg.author.send(
    "Supported Commands" + "\n" + "All StreamLine bot commands will be prefixed with a tilde (~)." + "\n" + "`~set home/~set h` - designates the channel that streaming announcements will be posted in." + "\n" + "`~set role/~set r` - designates the user role that will be pinged during announcements." + "\n" + "A role argument is required. `Example: ~set role @Subscribers`");
  }

  //Set home
  if (msg.content === "~set home" || (msg.content === "~set h")) {      
    db.set(msg.guild.id, [msg.channel.id, null]).then(() => {
      msg.channel.send("Streaming announcement channel set.");
    });
  }
  
  //Set role
  if (msg.content.startsWith("~set r ") || msg.content.startsWith("~set role")) {
    
    db.get(msg.guild.id).then(value => { 
      if (msg.content.includes("~set role")){
        db.set(msg.guild.id, [value[0], msg.content.substring(10, msg.content.length)]);
      }
      else {
        db.set(msg.guild.id, [value[0], msg.content.substring(7, 
        msg.content.length)]);
      }
    });
    
    db.get(msg.guild.id).then(value => { 
      pr = value[1];
      if (pr == null || pr.toString().charAt('0') != '<'){
        msg.channel.send("Please input a proper role!");
        return;
      }
      else {
        msg.channel.send("Role to ping has been set.");
      }
    })
  }

  //Spinner command
  if(msg.content.startsWith("~spinner")) {
    entries = msg.content.substring(9, msg.content.length).split(" ");
    numOptions = entries.length;
    selectedOption = Math.floor(Math.random() * numOptions);
    msg.channel.send(entries[selectedOption]);
  }

  //Dad mode
  if(msg.content==("~enable dm")){
    dadMode[msg.guild.id] = true;
    msg.channel.send("dadMode enabled");
  }
  if(msg.content==("~disable dm")){
    dadMode[msg.guild.id] = false;
    msg.channel.send("dadMode disabled");
  }
  
  if(dadMode[msg.guild.id] == true){
    if(msg.content.toLowerCase().includes("i'm ")){
      msg.channel.send("Hi! " + msg.content.substring(msg.content.toLowerCase().search("i'm")+4, msg.content.length)+ ", I am StreamLine bot");
    }
    if(msg.content.toLowerCase().includes("im ")){
      msg.channel.send("Hi! " + msg.content.substring(msg.content.toLowerCase().search("im")+3, msg.content.length)+ ", I am StreamLine bot");
    }
  }
})

//detects if someone is streaming
client.on('voiceStateUpdate', (oldState, newState) => {
  try {
    if (oldState === newState){
      return;
    }

    if (newState.streaming && (newState.channel != null) && !oldState.streaming) {
      db.get(newState.guild.id).then(value => {
        ch = value[0];
        pr = value[1];

        if(pr != null) {
          output = `Hey ${pr}! ${newState.member} is streaming in ${newState.channel}!`;
        }
        else {
          output = `Looks like ${newState.member} is streaming! but I haven't been given a role to ping.`;
        }
        client.channels.cache.get(ch).send(output);
      });
    }
  }
  catch(e) {
    output = "Please ensure that I have the proper permissions and that I have been given a home." + " `~set h`";
    if(newState.member.guild.systemChannel != null){
      newState.member.guild.systemChannel.send(output);
    }
    else{
      defaultChannel = null;
      newState.member.guild.channels.cache.forEach((channel) => {
        if(channel.type == "text" && defaultChannel == null) {
          if(channel.permissionsFor(newState.member.guild.me).has("SEND_MESSAGES")) {
            defaultChannel = channel;
        }
        defaultChannel.send(output);
      }
    })
    }
  }
})

refreshBot();
client.login(process.env.TOKEN)