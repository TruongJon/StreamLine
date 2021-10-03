module.exports = eventHandler

const Discord = require("discord.js");

const Database = require("@replit/database");
const db = new Database();

const gTTS = require("gtts");

var fs = require("fs");
const ytdl = require("ytdl-core");

var vcUtils = require("./VoiceChannelUtils");

var players = [];
var intervals = {};
var answered = [];
var noRepeats = [];
var points = [];
var name = {};
var musicQueue = [];
    
function player(name, score) {
  this.name = name;
  this.score = score;

  this.addScore = function (add) {
  this.score += add;
  return score;
  };
}    

function eventHandler(client) {

  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  //Sends instructions upon joining a guild
  client.on("guildCreate", (guild) => {
    output = "Thanks for inviting me! Use `~h` to see my commands.";
    if (guild.systemChannel != null) {
      guild.systemChannel.send(output);
    } else {
      defaultChannel = null;
      guild.channels.cache.forEach((channel) => {
        if (channel.type == "text" && defaultChannel == null) {
          if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
            defaultChannel = channel;
          }
          defaultChannel.send(output);
        }
      });
    }
  });

  //**STREAM ANNOUNCEMENT COMMANDS**

  //Announces if a user is streaming.
  client.on("voiceStateUpdate", (oldState, newState) => {
    try {
      if (oldState === newState) {
        return;
      }
      if (
        newState.streaming &&
        newState.channel != null &&
        !oldState.streaming
      ) {
        db.get(newState.guild.id).then((value) => {
          ch = value[0];
          pr = value[1];

          if (pr != null) {
            output = `Hey ${pr}! ${newState.member} is streaming in ${newState.channel}!`;
          } else {
            output = `Looks like ${newState.member} is streaming! but I haven't been given a role to ping.`;
          }
          client.channels.cache.get(ch).send(output);
        });
      }
    } catch (e) {
      output =
        "Please ensure that I have the proper permissions and that I have been given a home." +
        " `~set h`";
      if (newState.member.guild.systemChannel != null) {
        newState.member.guild.systemChannel.send(output);
      } else {
        defaultChannel = null;
        newState.member.guild.channels.cache.forEach((channel) => {
          if (channel.type == "text" && defaultChannel == null) {
            if (
              channel
                .permissionsFor(newState.member.guild.me)
                .has("SEND_MESSAGES")
            ) {
              defaultChannel = channel;
            }
            defaultChannel.send(output);
          }
        });
      }
    }
  });

  client.on("message", (msg) => {
    //Help Command
    if (msg.content === "~help" || msg.content === "~h") {
      msg.author.send({
        embed: {
          color: 3447003,
          description:
            "**StreamLine Commands**" +
            "\n" +
            "All StreamLine bot commands are prefixed with a tilde (~)." +
            "\n" +
            "** Stream Commands**" +
            "\n" +
            "`~set home/~set h` - Designate the current channel as the channel that streaming announcements will be posted in." +
            "\n" +
            "`~set role/~set r` - Designate the user role that will be pinged during announcements." +
            "\n" +
            "- A role argument is required." +
            "\n" +
            "- Example: *~set role @Subscribers*" +
            "\n" +
            "`~join` - StreamLine will join the voice channel that the user is in" +
            "\n" +
            "`~leave` - StreamLine will leave the voice channel." +
            "\n" +
            "`~tts` - StreamLine will convert your text into speech in the voice channel that the user is in." +
            "\n" +
            "- Example: *~tts sushi is an amazing food*" +
            "\n" +
            "**Music Commands**" +
            "\n" +
            "`~play/~p` - Plays a song or add a song to the queue." +
            "\n" +
            "- A URL argument is required." +
            "\n" +
            "- Example: *~play https://youtu.be/g1p5eNOsl7I*" +
            "\n" +
            "`~remove/~r` - Skips the currently playing song." +
            "\n" +
            "`~queue/~q` - Displays the current queue." +
            "\n" +
            "`~remove/~r` - Removes a song from the queue." +
            "\n" +
            "- An integer argument is required, representing the queue number." +
            "\n" +
            "- Examples: *~remove 3*" +
            "\n" +
            "`~clear/~c`- Clears the entire queue." +
            "\n" +
            "`~stop`- Stops the current audio." +
            "\n" +
            "**Fun Commands**" +
            "\n" +
            "`~anisong` - StreamLine will play a randomly selected anime or game songs. Users then guess the anime/game series or the song name itself in order to score points." +
            "\n" +
            "`~spinner` - Randomly selects from the user provided options." +
            "\n" +
            "-At least one argument is required." +
            "\n" +
            "- Example: *~spinner Red Blue Green*" +
            "\n" +
            "`~enable dm` - Enables StreamLine to act like your very own dad (StreamLine will respond to every message that contains im or i'm with a dad joke.)." +
            "\n" +
            "`~disable dm` - Disables StreamLine's dad mode"
        }
      });
    }

    //Set Home
    if (msg.content === "~set home" || msg.content === "~set h") {
      db.set(msg.guild.id, [msg.channel.id, null, null]).then(() => {
        msg.channel.send({
          embed: {
            color: 3447003,
            description: "Streaming announcement channel set.",
          },
        });
      });
    }

    //Set Role
    if (
      msg.content.startsWith("~set r ") ||
      msg.content.startsWith("~set role")
    ) {
      db.get(msg.guild.id).then((value) => {
        if (msg.content.includes("~set role")) {
          db.set(msg.guild.id, [
            value[0],
            msg.content.substring(10, msg.content.length),
            null,
          ]);
        } else {
          db.set(msg.guild.id, [
            value[0],
            msg.content.substring(7, msg.content.length),
            null,
          ]);
        }
      });
      db.get(msg.guild.id).then((value) => {
        pr = value[1];
        if (pr == null || pr.toString().charAt("0") != "<") {
          msg.channel.send("Please input a proper role!");
          return;
        } else {
          msg.channel.send("Role to ping has been set.");
        }
      });
    }

    //**VOICE CHANNEL COMMANDS**

    //Joins the voice channel that the user that used the command is in.
    if (msg.content === "~join") {
      if (msg.member.voice.channel == undefined) {
        msg.channel.send("Please join a vc!");
        return;
      }
      try {
        msg.member.voice.channel.join().then((connection) => {
          msg.channel.send(`Joined ${msg.member.voice.channel}!`);
        });
      } catch (e) {}
    }

    //Leaves the voice channel that the user that used the command is in.
    if (msg.content === "~leave") {
      try {
        clearInterval(intervals[msg.guild.id]);
        msg.guild.voice.connection.disconnect();
      } catch (e) {}
    }

    //Performs text to speech on the message specified in the command in the voice channel that the user that used the command is in.
    if (msg.content.startsWith("~tts")) {
      if (msg.content.length < 5) {
        msg.channel.send("Invalid message!");
        return;
      }
      if (msg.member.voice.channel == undefined) {
        msg.channel.send("Please join a vc!");
        return;
      }
      (async () => {
        vcUtils.createMp3(msg);
        await new Promise((resolve) => setTimeout(resolve, 500));
        vcUtils.speak(msg);
      })();
    }

    //Plays the audio of a specified Youtube video link in the voice channel that the user that used the command is in, then leaves after the audio has completed.
    if (msg.content.startsWith("~play")|| msg.content.split(" ")[0] == "~p") {
      if (msg.member.voice.channel == undefined) {
        msg.channel.send("Please join a vc!");
        return;
      }
      clearInterval(intervals[msg.guild.id]);
      link = msg.content.split(" ")[1];
       if(link == undefined){
        if(musicQueue[msg.guild.id].length > 0){
          musicPlayer();
          return;
        }
        else{
           msg.channel.send("No songs left in queue!");
        }
      }
      if(link == undefined || !ytdl.validateURL(link)){
        msg.channel.send("Please input a proper URL!");
        return;
      }
      if(musicQueue[msg.guild.id]==undefined){
        musicQueue[msg.guild.id] = [];
      }
      musicQueue[msg.guild.id].push(link);
      if(musicQueue[msg.guild.id].length == 1){
        musicPlayer();
      }
      msg.delete();
      (async () => {
        title = await ytdl.getBasicInfo(link);
        str = `${title.videoDetails.title}`;
        msg.channel.send({
        embed: {
          color: 3447003,
          description: `added song [${str}](${link}) to position ${musicQueue[msg.guild.id].length} in queue`,
          },
        });
      })();
    }

    //Helper method to manage a queue of audio links.
    function musicPlayer(){
      msg.member.voice.channel.join().then(async (connection) => {
        if(connection.isPlaying)
        link = musicQueue[msg.guild.id][0];
        if(musicQueue[msg.guild.id][0] != link){
          link = musicQueue[msg.guild.id][0];
        }
        stream = ytdl(link, { filter: "audioonly" });
        dispatcher = await connection.play(stream);
        title = await ytdl.getBasicInfo(musicQueue[msg.guild.id][0]);
        str = `Currently playing : ${title.videoDetails.title} `;
        msg.channel.send({
        embed: {
          color: 3447003,
          description: `${str}`,
          },
        });
        dispatcher.on("finish", () => {
          musicQueue[msg.guild.id].shift();
          if(musicQueue[msg.guild.id].length == 0){
            connection.disconnect();
          }
          else{
            musicPlayer();
          }
        });
      });
    }

    //Displays the current queue of songs.
    if (msg.content === "~queue" || msg.content === "~q") {
      if(musicQueue[msg.guild.id] == undefined || musicQueue[msg.guild.id].length == 0 ){
        msg.channel.send("Queue is empty!");
        return;
      }
      (async () => {
        try {
          str = 'Current Queue:';
          for(i = 0; i < musicQueue[msg.guild.id].length;i++){
          title = await ytdl.getBasicInfo(musicQueue[msg.guild.id][i]);
          str += `\n${i+1}. ${title.videoDetails.title} `;
          }
        msg.channel.send({
        embed: {
          color: 3447003,
          description: `${str}`,
        },
      });

      } catch (err) {
        console.error(err);
      }
    })();
    }

    //Skips the current playing song.
    if (msg.content === "~skip" || msg.content === "~s") {
      musicQueue[msg.guild.id].shift();
      if( musicQueue[msg.guild.id].length == 0){
        vcUtils.songEnd(msg); 
        return;
      }
      musicPlayer();
    }

    //Removes the specified song in the queue.
    if(msg.content.startsWith("~remove") || msg.content.split(" ")[0] == "~r"){
      if(musicQueue[msg.guild.id] == undefined || musicQueue[msg.guild.id].length == 0){
        msg.channel.send("Queue is empty!");
        return;
      }
      try{
        if(!isNaN(msg.content.split(" ")[1])){
          if(msg.content.split(" ")[1] < 1 || msg.content.split(" ")[1] > musicQueue[msg.guild.id].length){
            msg.channel.send("Not a valid song number!");
            return;
          }
          musicQueue[msg.guild.id].splice(msg.content.split(" ")[1]-1,1);
          msg.channel.send(`Song at position ${msg.content.split(" ")[1]} removed.`);
          if(msg.content.split(" ")[1] == 1 && msg.guild.voice.channel){
            vcUtils.songEnd(msg);
            if(musicQueue[msg.guild.id] != undefined && musicQueue[msg.guild.id].length > 0){
              musicPlayer();
            }
          }
        }
        else{
          msg.channel.send("Not a valid song number!");
        }
      }
      catch(e){
        msg.channel.send("Not a valid song number!");
      }
    }

    //Clears the queue
    if (msg.content === "~clear" || msg.content === "~c") {
      musicQueue[msg.guild.id] = []
      vcUtils.songEnd(msg);
    }

    /*
    Play a voice channel game where a randomly selected anime or game song is played. Users may then either guess the series origin or the song name itself to score points.
    */
    if (msg.content.startsWith("~anisong")) {
      if(musicQueue[msg.guild.id] != undefined && musicQueue[msg.guild.id].length > 0){
        msg.channel.send("Queue paused! beginning Anisong!")
      }
      clearInterval(intervals[msg.guild.id]);
      players[msg.guild.id] = [];
      noRepeats[msg.guild.id] = [];
      answered[msg.guild.id] = [];
      points[msg.guild.id] = 5;
      gameTime();
      intervals[msg.guild.id] = setInterval(gameTime, 30000);
    }

    /*
    Updates the amount of obtainable points each round. The first user to guess the series or song name correctly will earn 5 points, while subsequent users will gain a point less until eventually only 1 point may be rewarded for a correct answer. 
    */
    function gameTime() {
      queueAnisong();
      const filter = (m) => m.content != "";
      var collector = msg.channel.createMessageCollector(filter, {
        time: 30001,
      });
      collector.on("collect", (m) => {
        answerCheck(m);
      });
      collector.on("end", (m) => {
        if (answered[msg.guild.id].length != players[msg.guild.id].length || answered[msg.guild.id].length == 0) {
          animeName = name[msg.guild.id][0].split(" ");
          songName = name[msg.guild.id][name[msg.guild.id].length - 1].split(" ");
          msg.channel.send({
            embed: {
              color: 3447003,
              description: `Song played was ${vcUtils.capitalize(songName)} 
              from ${vcUtils.capitalize(animeName)}`,
            },
          });
        }
        if (points[msg.guild.id] == 5) {
          return;
        }
        printScore();
        points[msg.guild.id] = 5;
        answered[msg.guild.id] = [];
      });
    }

    //Helper method to randomly select and play an anime song in a voice channel.
    function queueAnisong() {
      fs.readFile("./res/Songs.txt", "utf8", function (err, songs) {
        if (err) throw err;
        fs.readFile("./res/AudioTitle.txt", "utf8", function (err, titles) {
          if (err) throw err;
          numSongs = songs.split("\n").length;
          songNumber = Math.floor(Math.random() * numSongs);
          link = songs.split("\n")[songNumber];
          name = titles.split("$")[songNumber].split(" / ");
          while (noRepeats[msg.guild.id].includes(link)) {
            songNumber = Math.floor(Math.random() * numSongs);
            link = songs.split("\n")[songNumber];
            name = titles.split("$")[songNumber].split(" / ");
          }
          noRepeats[msg.guild.id][noRepeats[msg.guild.id].length] = link;
          msg.member.voice.channel.join().then(async (connection) => {
            for (i = 0; i < name.length; i++) {
              name[i] = name[i].replace("\n", "");
              name[i] = name[i].trim();
            }
            console.log(name + ` ${songNumber}`);
            anisong = ytdl(link, { filter: "audioonly" });
            dispatcher = connection.play(anisong);
          });
          name[msg.guild.id] = name;
        });
      });
    }

    //Helper method to check if an answer is correct.
    function answerCheck(m) {
      if (name.includes(m.content.toLowerCase())) {
        if (points[msg.guild.id] < 1) {
          points[msg.guild.id] = 1;
        }
        if (players[msg.guild.id].length == 0) {
          players[msg.guild.id] = [
            new player(m.member.displayName, points[msg.guild.id]),
          ];
          answered[msg.guild.id][0] = players[msg.guild.id][0].name;
          points[msg.guild.id]--;
          return;
        } else if (vcUtils.checkName(players[msg.guild.id], m.member.displayName)) {
          for (i = 0; i < players[msg.guild.id].length; i++) {
            if (
              players[msg.guild.id][i].name == m.member.displayName &&
              !answered[msg.guild.id].includes(players[msg.guild.id][i].name)
            ) {
              players[msg.guild.id][i].addScore(points[msg.guild.id]);
              answered[msg.guild.id][i] = players[msg.guild.id][i].name;
              points[msg.guild.id]--;
              return;
            }
          }
        } else {
          players[msg.guild.id][players[msg.guild.id].length] = new player(
            m.member.displayName,
            points[msg.guild.id]
          );
          points[msg.guild.id]--;
          for (i = 0; i < players[msg.guild.id].length; i++) {
            if (players[msg.guild.id][i].name == m.member.displayName) {
              answered[msg.guild.id][i] = players[msg.guild.id][i].name;
            }
          }
          return;
        }
      }
    }

    //Displays the leaderboard in the text channel that the game is being played in.
    function printScore() {
      str = "__**Current Leaderboard**__\n";
      players[msg.guild.id].sort(function (a, b) {
        return b.score - a.score;
      });
      for (i = 0; i < players[msg.guild.id].length; i++) {
        str += `${players[msg.guild.id][i].name}: ${
          players[msg.guild.id][i].score
        } points \n`;
      }
      msg.channel.send({
        embed: {
          color: 3447003,
          description: `${str}`,
        },
      });
    }

    //Stops the currently playing audio.
    if (msg.content.startsWith("~stop")) {
      clearInterval(intervals[msg.guild.id]);
      vcUtils.songEnd(msg);
    }

    //**MISCELLANEOUS COMMANDS

    //Randomly selects from user provided options.
    if (msg.content.startsWith("~spinner")) {
      entries = msg.content.substring(9, msg.content.length).split(" ");
      numOptions = entries.length;
      selectedOption = Math.floor(Math.random() * numOptions);
      msg.channel.send(entries[selectedOption]);
    }

    //Dad Mode
    if (msg.guild != null) {
      db.get(msg.guild.id).then((value) => {
        ch = value[0];
        pr = value[1];
        dm = value[2];

        if (msg.content == "~enable dm") {
          db.set(msg.guild.id, [ch, pr, true]);
          msg.channel.send("dadMode enabled");
        }

        if (msg.content == "~disable dm") {
          db.set(msg.guild.id, [ch, pr, false]);
          msg.channel.send("dadMode disabled");
        }

        if (dm == true) {
          if (msg.author.bot) {
            return;
          }
          if (msg.content.toLowerCase().includes("i'm ")) {
            msg.channel.send(
              "Hi! " +
                msg.content.substring(
                  msg.content.toLowerCase().search("i'm") + 4,
                  msg.content.length
                ) 
              + ", I'm StreamLine bot"
            );
          }
          if (msg.content.toLowerCase().includes("im ")) {
            msg.channel.send(
              "Hi! " +
                msg.content.substring(
                  msg.content.toLowerCase().search("im") + 3,
                  msg.content.length) 
              + ", I'm StreamLine bot"
            );
          }
        }
      });
    }
  });
}