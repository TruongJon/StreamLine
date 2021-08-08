module.exports = eventHandler

const Discord = require("discord.js")

const Database = require("@replit/database")
const db = new Database()

const gTTS = require('gtts')

var fs = require('fs')
const ytdl = require('ytdl-core')

function eventHandler(client) {

//Anisong variables
let players = [];
var intervals = {};
var answered = [];
var noRepeats = [];
var points = [];
var name = {};

function player(name,score){
  this.name = name;
  this.score = score;

  this.addScore = function(add){
  this.score+=add;
  return score;
  }
}

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
    msg.author.send({ embed: {
    color: 3447003,
    description: "**StreamLine Commands**" + "\n" + "All StreamLine bot commands will be prefixed with a tilde (~)."+ "\n" + "** Stream Commands**" + "\n" + "`~set home/~set h` - designates the channel that streaming announcements will be posted in." + "\n" + "`~set role/~set r`" + "- designates the user role that will be pinged during announcements." + "\n" + "-A role argument is required." + "\n" + "- Example: *~set role @Subscribers*" + "\n" + "**Fun Commands**" + "\n" + "`~spinner` - randomly selects from the provided options." + "\n" + "-At least one argument is required, although 2 or more arguments are suggested." + "\n" + "- Example: *~spinner Red Blue Green*" + "\n" + "`~enable dm` - enables StreamLine to act like your very own dad (StreamLine will respond to every message that contains \"im\" or \"i'm\")." + "\n" +" `~disable dm` - disables StreamLine's dad mode"
    }
  })
}

  //Set home
  if(msg.content === "~set home" || (msg.content === "~set h")) {
    db.set(msg.guild.id, [msg.channel.id, null, null]).then(() => {
      msg.channel.send({ embed: {
        color: 3447003,
        description: "Streaming announcement channel set."
      }
    });
  })
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

  if(msg.content === "~leave") {
    try {
      msg.guild.voice.connection.disconnect();
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

  //Resets the sound file corresponding to the guild
  function deleteMp3(){
    fs.unlink(filename, function(err){
        if (err) msg.channel.send("woah woah slow down there! Too many messages!");
        console.log("file deleted");
      });
  }
  
  //Uses text to speech in a voice channel
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
  
  //Plays the audio of a Youtube video in a voice channel then leaves
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

  //Play a voice channel game where users guess a playing anime song
  if(msg.content.startsWith("~anisong")) {
    clearInterval(intervals[msg.guild.id]);
    players[msg.guild.id] = [];
    noRepeats[msg.guild.id] = [];
    answered[msg.guild.id] = [];
    points[msg.guild.id] = 5;
    gameTime();
    intervals[msg.guild.id] = setInterval(gameTime,30000);
  }

  if(msg.content.startsWith("~stop")) {
    clearInterval(intervals[msg.guild.id]);
     msg.member.voice.channel.join()
      .then(async connection => { 
        dispatcher = connection.play(ytdl("https://youtu.be/JF577d38sP0"));
        dispatcher.end();
      })
  }
  
  //Updates obtainable points every round
  function gameTime(){
    queueAnisong();
    const filter = m => m.content != "";
    var collector = msg.channel.createMessageCollector(filter,{ time: 30001});
    collector.on('collect', m => {
      answerCheck(m);
      console.log(points[msg.guild.id]);
    });
    collector.on('end', m =>{
      if(answered[msg.guild.id].length != players[msg.guild.id].length){
        animeName = name[msg.guild.id][0].split(" ");
        songName = name[msg.guild.id][name[msg.guild.id].length - 1].split(" ");
        msg.channel.send({ embed: {
            color: 3447003,
            description: `Song played was ${capitalize(songName)} from ${capitalize(animeName)}`
          }
        });
      }
      if(points[msg.guild.id] == 5){
        console.log("no one answered");
        return;
      }
      printScore();
      points[msg.guild.id] = 5;
      answered[msg.guild.id] = [];
    })
  }

  //Randomly selects and plays an anime song in the voice channel
  function queueAnisong(){
    fs.readFile('./res/Songs.txt', 'utf8', function(err, songs) {
    if (err) throw err;
      fs.readFile('./res/AudioTitle.txt', 'utf8', function(err, titles) {
        if (err) throw err;
        numSongs = songs.split("\n").length;
        songNumber = Math.floor(Math.random() * numSongs);
        link = songs.split("\n")[songNumber];
        name = titles.split("$")[songNumber].split(" / ");
        while(noRepeats[msg.guild.id].includes(link)){
          songNumber = Math.floor(Math.random() * numSongs);
          link = songs.split("\n")[songNumber];
          name = titles.split("$")[songNumber].split(" / ");
        }
        noRepeats[msg.guild.id][noRepeats[msg.guild.id].length] = link;
         msg.member.voice.channel.join()
        .then(async connection => { 
          
          for(i = 0; i < name.length; i++){
            name[i] = name[i].replace("\n","");
            name[i] = name[i].trim();
          }
          console.log(name +` ${songNumber}`);
          anisong = ytdl(link,{filter: 'audioonly' });
          dispatcher = connection.play(anisong);
        })
        name[msg.guild.id] = name;
      })
    })
  }
  
  //Checks to see if answer is valid
  function answerCheck(m){
    if(name.includes(m.content.toLowerCase())){
      if(points[msg.guild.id] < 1){
        points[msg.guild.id] = 1;
      }
      if(players[msg.guild.id].length == 0){
        players[msg.guild.id] = [new player(m.member.displayName,points[msg.guild.id])];
        answered[msg.guild.id][0] = players[msg.guild.id][0].name;
        points[msg.guild.id]--;
        return;
      }
      else if (checkName(players[msg.guild.id],m.member.displayName)){
        for(i =0;i<players[msg.guild.id].length;i++){
        if(players[msg.guild.id][i].name == m.member.displayName &&! answered[msg.guild.id].includes(players[msg.guild.id][i].name)) {
          players[msg.guild.id][i].addScore(points[msg.guild.id]);
          answered[msg.guild.id][i] = players[msg.guild.id][i].name;
          points[msg.guild.id]--;
          return;
          }
        }
      }
      else{
        players[msg.guild.id][players[msg.guild.id].length] = new player(m.member.displayName,points[msg.guild.id]);
        points[msg.guild.id]--;
        for(i = 0;i<players[msg.guild.id].length;i++){
          if(players[msg.guild.id][i].name == m.member.displayName) {
            answered[msg.guild.id][i] = players[msg.guild.id][i].name;
          }
        }
        return;
      }
    }
    console.log(points[msg.guild.id]);
  }

  //Checks if a name is contained with an array
  function checkName(arr,name){
    for(i = 0; i < arr.length;i++){
      if(arr[i].name == name){
        return true;
      }
    }
    return false;
  }

  //Capitalizes the first letter of every word in an array
  function capitalize(arr) {
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    var result = '';
    for(i = 0; i < arr.length; i++) {
      if (alpha.includes(arr[i].charAt(0).toLowerCase())) {
        temp = arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
        result += temp + " ";
      }
      else {
        temp = arr[i].charAt(0) + arr[i].charAt(1).toUpperCase() 
        + arr[i].substring(2);
        result += temp + " ";
      }
    }
    return result;
  }

  //Prints leaderboard in the text channel
  function printScore(){
    str = "__**Current Leaderboard**__\n";
     players[msg.guild.id].sort(function(a, b){
     return b.score - a.score;
     });
    console.log(players[msg.guild.id]);
    for(i = 0; i < players[msg.guild.id].length;i++){
      str += `${players[msg.guild.id][i].name}: ${players[msg.guild.id][i].score} points \n` 
    }
    msg.channel.send({ 
      embed: {
      color: 3447003,
      description: `${str}`
      }
    });
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
}

