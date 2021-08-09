const Discord = require("discord.js")

const gTTS = require('gtts')

var fs = require('fs')
const ytdl = require('ytdl-core')

module.exports = {
  
  //Creates a sound file for the text to speech
  createMp3: async function(msg) {
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
  },

  //Resets the sound file corresponding to the guild
  deleteMp3: function(msg){
    fs.unlink(filename, function(err){
        if (err) msg.channel.send("woah woah slow down there! Too many messages!");
        console.log("file deleted");
    });
  },
  
  //Uses text to speech in a voice channel
  speak: async function(msg){
    msg.member.voice.channel.join()
      .then(async connection => { 
        console.log("Connected");
        filename = msg.guild.id.toString() + ".mp3";
        dispatcher = await connection.play(filename);
        dispatcher.on("finish", () => {
        this.deleteMp3(msg);
      });   
    })
  },

  //ends currently playing song
  songEnd:function(msg){
      msg.member.voice.channel.join().then(async (connection) => {
          dispatcher = connection.play(ytdl("https://youtu.be/JF577d38sP0"));
          dispatcher.end();
      });
    },

  //Checks if a name is contained with an array
  checkName: function(arr,name){
    for(i = 0; i < arr.length;i++){
      if(arr[i].name == name){
        return true;
      }
    }
    return false;
  },

  //Capitalizes the first letter of every word in an array
  capitalize: function(arr) {
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
  },
}