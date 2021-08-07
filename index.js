const Discord = require("discord.js")
const client = new Discord.Client()
const refreshBot = require("./server")

const Database = require("@replit/database")
const db = new Database()

const gTTS = require('gtts')

var fs = require('fs');
const ytdl = require('ytdl-core');

var music = {};

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

//Bot commands
client.on("message", msg => {

  //Help command
  if(msg.content === "~help" || (msg.content === "~h")) {  
    msg.author.send(
    "**StreamLine Commands**" + "\n" + "All StreamLine bot commands will be prefixed with a tilde (~)."+ "\n" + "** Stream Commands**" + "\n" + "`~set home/~set h` - designates the channel that streaming announcements will be posted in." + "\n" + "`~set role/~set r`" + "- designates the user role that will be pinged during announcements." + "\n" + "-A role argument is required." + "\n" + "- Example: *~set role @Subscribers*" + "\n" + "**Fun Commands**" + "\n" + "`~spinner` - randomly selects from the provided options." + "\n" + "-At least one argument is required, although 2 or more arguments are suggested." + "\n" + "- Example: *~spinner Red Blue Green*" + "\n" + "`~enable dm` - enables StreamLine to act like your very own dad (StreamLine will respond to every message that contains \"im\" or \"i'm\")." + "\n" +" `~disable dm` - disables StreamLine's dad mode");
  }

  //Set home
  if(msg.content === "~set home" || (msg.content === "~set h")) {
    db.set(msg.guild.id, [msg.channel.id, null, null]).then(() => {
      msg.channel.send("Streaming announcement channel set.");
    });
  }
  
  //Set role
  if(msg.content.startsWith("~set r ") || msg.content.startsWith("~set role")) {
    
    db.get(msg.guild.id).then(value => { 
      if (msg.content.includes("~set role")){
        db.set(msg.guild.id, [value[0], msg.content.substring(10, msg.content.length),null]);
      }
      else {
        db.set(msg.guild.id, [value[0], msg.content.substring(7, 
        msg.content.length),null]);
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

  //Joins the voice channel that the user is in
  if(msg.content === "~join") {
    if(msg.member.voice.channel == undefined){
      msg.channel.send("Please join a vc!");
      return;
    }
    try {
      msg.member.voice.channel.join()
      .then(connection => {
        msg.channel.send(`Joined ${msg.member.voice.channel}!`)
      })
    }
    catch(e){
    }
  }

  // if (msg.content === "~tts stop") {
  //  msg.member.voice.channel.join()
  //     .then(async connection => { 
  //   gtts = new gTTS(' ', 'en');
  //   filename = msg.guild.id.toString() + ".mp3";
  //   gtts.save(filename, ()=> {
  //   });
  //   })
  // }

  if(msg.content === "~leave") {
    try {
      msg.guild.voice.connection.disconnect();
      //deleteMp3();
    }
    catch(e){
    }
  }

  //Text to speech on the message
  if(msg.content.startsWith("~tts")) {
    if(msg.content.length < 5){
      msg.channel.send("invalid message!");
      return;
    }
    if(msg.member.voice.channel == undefined){
      msg.channel.send("Please join a vc!");
      return;
    }
    (async () =>{
       createMp3();
       await new Promise(resolve => setTimeout(resolve, 500));
       speak();
    })()
  }

  //Creates a sound file for the text to speech
  async function createMp3(){
    try{
      var message = msg.content.substring(5, msg.content.length); 
    gtts = new gTTS(message, 'en');
    filename = msg.guild.id.toString() + ".mp3";
    gtts.save(filename, ()=> {
      console.log("file created");
    });
    }
    catch(e){
      msg.channel.send("woah woah, slow down there!");
    }
  }

  function deleteMp3(){
    fs.unlink(filename, function(err){
        if (err) msg.channel.send("woah woah slow down there! Too many messages!");
        console.log("file deleted");
      });
  }
  
  async function speak(){
     msg.member.voice.channel.join()
      .then(async connection => { 
        console.log("Connected");
        filename = msg.guild.id.toString() + ".mp3";
        dispatcher = await connection.play(filename);
        dispatcher.on("finish", () => {
         deleteMp3();
      });   
    })
  }

  if(msg.content.startsWith("~stream")){
    link = msg.content.split(" ")[1];
    msg.member.voice.channel.join()
      .then(async connection => { 
        stream = ytdl(link);
        dispatcher = await connection.play(stream);
        dispatcher.on("finish", () => {
         connection.disconnect();
      });   
    })
  }

  if(msg.content.startsWith("~anisong")) {
    queueAnisong();
    const filter = m => m.content != "";
    var collector = msg.channel.createMessageCollector(filter,{ time: 30000});
    collector.on('collect', m => {
      if(name.includes(m.content.toLowerCase())){
        console.log(m.content);
        m.channel.send("Correct");
        collector.resetTimer();
        queueAnisong();
      }
    });

    collector.on('end', collected => {
      msg.channel.send("Ran out of time. Please try again.");
      if(msg.member.voice.channel == null || msg.member.voice.channel == undefined ){
        return;
      }
       msg.member.voice.channel.join()
      .then(async connection => {
        connection.disconnect();
      })
    });
  }

  function queueAnisong(){
    fs.readFile('./res/Songs.txt', 'utf8', function(err, songs) {
    if (err) throw err;
      fs.readFile('./res/AudioTitle.txt', 'utf8', function(err, titles) {
        if (err) throw err;
        numSongs = songs.split("\n").length;
        songNumber = Math.floor(Math.random() * numSongs);
         msg.member.voice.channel.join()
        .then(async connection => { 
          link = songs.split("\n")[songNumber];
          name = titles.split("$")[songNumber].split(" / ");
          for(i = 0; i < name.length; i++){
            name[i] = name[i].replace("\n","");
            name[i] = name[i].trim();
          }
          console.log(name +` ${songNumber}`);
          //console.log(link);
          anisong = ytdl(link,{filter: 'audioonly' });
          dispatcher = connection.play(anisong);
        })
      })
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
  if(msg.guild != null){
     db.get(msg.guild.id).then(value => {
      ch = value[0];
      pr = value[1]; 
      dm = value[2];

    if(msg.content==("~enable dm")){
      db.set(msg.guild.id,[ch, pr, true]);
      msg.channel.send("dadMode enabled");
    }

    if(msg.content==("~disable dm")){
      db.set(msg.guild.id,[ch, pr, false]);
      msg.channel.send("dadMode disabled");
    }
  
    if(dm == true){
      if(msg.author.bot){
        return;
      }
      if(msg.content.toLowerCase().includes("i'm ")){
        msg.channel.send("Hi! " + msg.content.substring(msg.content.toLowerCase().search("i'm")+4, msg.content.length)+ ", I'm StreamLine bot");
      }
      if(msg.content.toLowerCase().includes("im ")){
        msg.channel.send("Hi! " + msg.content.substring(msg.content.toLowerCase().search("im")+3, msg.content.length)+ ", I'm StreamLine bot");
      }
    }
   }); 
  }
})

//Detects if someone is streaming
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