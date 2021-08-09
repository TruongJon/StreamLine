## README: written by Jonathan Truong and Shemar Mahase

## Currently operating on Discord.js v12

StreamLine is a Discord bot developed to enhance the Discord streaming experience itself, rather than integrating with other streaming platforms such as Twitch that is often seen with other bots.

## Change Log

Projected Updates:
- Channel points
- Overlaying profile pictures onto memes

### **v1.6 (2021-8-09)**

Implemented Features:
- Users can now use the play command during a song without changing the current song. Instead, a song queue will be created.
- Added command to display the queue `~queue/~q`
- Added command to remove a song in the queue `~remove/~r`
- Added command to skip the currently play song `~skip/~s` 
- Added command to clear the entire queue `~clear` 
- Added command to stop the current audio output `~stop` 
- StreamLine now deletes user play commands after successfully adding the songs to the queue, preventing clutter.

Fixed Bugs:
- Users must be in a voice channel to use the play command.
- Play command now checks if the provided URL is proper or not.
- Correct messages are now displayed when users try to remove valid and invalid song numbers from the queue.

### **v1.5 (2021-8-07)**

Implemented Features:
- Anisong - a game where StreamLine will play randomly selected anime and game music. Users then guess the anime/game series or the song name itself in order to score points and compete with one another. `~anisong` 
- Added song playing feature. `~play/~p` 

Fixed Bugs:
- StreamLine sometimes played multiple songs at once.

### **v1.4 (2021-8-06)**

Implemented Features:
- Added text-to-speech feature in voice chats `~tts`
- Added voice channel join and leave commands `~join` and `~leave`

### **v1.3 (2021-8-04)**

Fixed Bugs:
- Data is now stored on a database, preventing settings on servers from resetting if StreamLine goes offline

### **v1.2 (2021-7-29)**

Implemented Features:
- Spinner command `~spinner`

### **v1.1 (2021-7-27)**

Implemented Features:
- Dad mode command `~enable dm/~disable dm`

Fixed Bugs:
- StreamLine no longer announces that a stream is live when a user leaves the voice call without ending their stream
- StreamLine can now operate in multiple servers simultaneously
- StreamLine now requests the proper permissions upon joining a server
- If no system channel is available, StreamLine will message in the next available channel
- Fixed a bug where unmuting/muting while streaming caused StreamLine to announce a stream

### **v1.0 (2021-7-26)**

Implemented Features:
- Added bot commands `~set home/~set h` and `~set role/~set r`
- Added livestream announcements feature

## Image Citation

All rights to StreamLine's icon belong to and have been authorized for use by our good friend Shirley Leung.