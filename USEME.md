## USEME: written by Jonathan Truong and Shemar Mahase

## Supported Commands

All StreamLine bot commands are prefixed with a tilde (~).

### Stream Commands

`~help/~h` - DMs the user a list of commands that can be peformed.

`~set home/~set h` - Designate the current channel as the channel that streaming announcements will be posted in.

`~set role/~set r` - Designate the user role that will be "pinged" during announcements.

- A role argument is required. 

- Example: *~set role @Subscribers*

`~join` - StreamLine will join the voice channel that the user is in.

`~leave` - StreamLine will leave the voice channel.

`~tts` - StreamLine will convert your text into speech in the voice channel that the user is in.

- Example: *~tts sushi is an amazing food*

### Music Commands

`~play/~p` - Plays a song or add a song to the queue.

- A URL argument is required.

- Example: *~play https://youtu.be/g1p5eNOsl7I*

`~remove/~r` - Skips the currently playing song.

`~queue/~q` - Displays the current queue.

`~remove/~r` - Removes a song from the queue.

- An integer argument is required, representing the queue number.

- Examples: *~remove 3*

`~clear/~c`- Clears the entire queue.

`~stop`- Stops the current audio.

### Fun Commands

`~anisong` - StreamLine will play a randomly selected anime or game songs. Users then guess the anime/game series or the song name itself in order to score points.

`~spinner` - Randomly selects from the user provided options.

- At least one argument is required. 

- Example: *~spinner Red Blue Green* 

`~enable dm` - Enables StreamLine to act like your very own dad.

- StreamLine will respond to every message that contains "im" or "i'm" with a dad joke. 

`~disable dm` - Disables StreamLine's dad mode.