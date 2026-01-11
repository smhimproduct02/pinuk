# Sound Files Setup

The game includes a sound system that requires audio files to be placed in the `/public/sounds/` directory.

## Required Sound Files

Place the following MP3 files in `/public/sounds/`:

1. **click.mp3** - UI click sound
2. **join.mp3** - Player join notification
3. **wolf_howl.mp3** - Night phase starts (werewolf turn)
4. **rooster.mp3** - Day phase starts (discussion)
5. **win.mp3** - Victory sound
6. **lose.mp3** - Defeat sound
7. **reveal.mp3** - Role reveal sound

## Current Status

⚠️ **Sound files are currently missing** - The game will function normally without sounds, but no audio will play until the files are added.

## How to Add Sounds

1. Create a `sounds` folder in the `public` directory
2. Add the MP3 files listed above
3. Redeploy the application

The SoundContext is configured to gracefully handle missing files without showing errors to users.
