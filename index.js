const Discord = require("discord.js")
const client = new Discord.Client()
const refreshBot = require("./server")
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var channel = {};
var pingrole = {};
var dadMode = {};
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

})

client.on("guildCreate", guild => {

  output = ("Thanks for inviting me, use `~h` for a list of my commands");
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
  if (msg.content === "~help" || (msg.content === "~h")) {  
    msg.author.send(
    "Supported Commands" + "\n" + "All StreamLine bot commands will be prefixed with a tilde (~)." + "\n" + "`~set home/~set h` - designates the channel that streaming announcements will be posted in." + "\n" + "`~set role/~set r` - designates the user role that will be pinged during announcements." + "\n" + "A role argument is required. `Example: ~set role @Subscribers`");
  }

  //Set home
  if (msg.content === "~set home" || (msg.content === "~set h")) {  
    channel[msg.guild.id] = msg.channel;
    msg.channel.send("Streaming announcement channel set.");
  }
  
  //Set role
   if (msg.content.includes("~set r") && (msg.content.substring(0,4)=="~set")) {
    if(msg.content.includes("~set role")){
      pingrole[msg.guild.id] = msg.content.substring(10,msg.length);
    }
    else{
      pingrole[msg.guild.id] = msg.content.substring(7,msg.content.length);
    }
    if(pingrole[msg.guild.id].charAt('0')!='<'){
      msg.channel.send("Please input a proper role!");
      pingrole[msg.guild.id] = null;
      return;
    }
    msg.channel.send("Role to ping has been set.");
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
      msg.channel.send("Hi! " + msg.content.substring(msg.content.toLowerCase().search("i'm")+4,msg.content.length)+ ", I am StreamLine bot");
    }
    if(msg.content.toLowerCase().includes("im ")){
      msg.channel.send("Hi! " + msg.content.substring(msg.content.toLowerCase().search("im")+3,msg.content.length)+ ", I am StreamLine bot");
    }
  }

  //Tabletop shenanigans
  // if (msg.content.toLowerCase().includes("jon")) {
  //   msg.channel.send("He has so many women.");
  // }

  // if (msg.content.toLowerCase().includes("shemar")) {
  //   msg.channel.send("He has the best puns");
  // }

  // if (msg.content.toLowerCase().includes("shirley")) {
  //   msg.channel.send("Punk");
  // }

  // if (msg.content.toLowerCase().includes("punk")) {
  //   msg.channel.send("ah yes I completely agree");
  // }

  // if (msg.content.toLowerCase().includes("vincent")) {
  //   msg.channel.send("He needs to touch grass.");
  // }

  // if (msg.content.toLowerCase().includes("liza")) {
  //   msg.channel.send("Fischl.");
  // }

  // if (msg.content.toLowerCase().includes("calvin")) {
  //   msg.channel.send("Sadly not klein");
  // }

  // if (msg.content.toLowerCase().includes("josh")) {
  //   msg.channel.send("Needs to get online");
  // }

  // if (msg.content.toLowerCase().includes("phil")) {
  //   msg.channel.send("Genshin god");
  // }

  // if (msg.content.toLowerCase().includes("allen")) {
  //   msg.channel.send("Goku1987642069litfam");
  // }

  // if (msg.content.toLowerCase().includes("never")) {
  //   msg.channel.send("https://youtu.be/o-YBDTqX_ZU");
  // }
})

//detects if someone is streaming
client.on('voiceStateUpdate', (oldState, newState) => {
  try {
    if (oldState === newState){
      return;
    }
    if (newState.streaming && (newState.channel != null) && !oldState.streaming) {
      if(pingrole[newState.guild.id] != null) {
        output = `Hey ${pingrole[newState.guild.id]}! ${newState.member} is streaming in ${newState.channel}!`
    }
    else{
      output = `Looks like ${newState.member} is streaming! but I haven't been given a role to ping.`
    }
    channel[newState.guild.id].send(output);
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