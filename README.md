# Kuubii Music Discord Bot

A high-performance, modern Discord Music Bot inspired by Beatra.app, tailored for private servers. Built with Node.js v23 and Discord.js v14.

## 🌟 Features

- **High-Quality Audio**: Streaming from YouTube, Spotify, and SoundCloud.
- **Modern UI/UX**: Interactive embeds with buttons for playback control.
- **Vietnamese Localization**: All messages and labels are in Vietnamese.
- **Advanced Functionality**:
    - 📻 **Autoplay**: Automatically find related tracks.
    - ♾️ **24/7 Mode**: Keep the bot in the voice channel.
    - 🎤 **Live Lyrics**: Integrated with Genius API.
    - 💾 **Persistence**: SQLite database for server settings.
- **Modular Code**: Clean and scalable structure.

## 🚀 Getting Started

### Prerequisites

- Node.js v23 or higher
- A Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))
- A Genius API Key ([Genius API](https://genius.com/api-clients))

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd kuubii-music-discord-bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DISCORD_TOKEN=your_bot_token
   CLIENT_ID=your_client_id
   GUILD_ID=your_guild_id
   GENIUS_API_KEY=your_genius_key
   DATABASE_HOST=5.161.72.213
   DATABASE_PORT=3306
   DATABASE_USER=u42439_XsGEVwuwJj
   DATABASE_PASS=YwufNSLQnDy6q+2BdYfPt@=z
   DATABASE_NAME=s42439_icer
   ```

4. **Run the bot**:
   ```bash
   npm start
   ```

## 📝 Commands

| Command | Description |
| :--- | :--- |
| `/play` | Play music from any support source or search. |
| `/skip` | Skip the current track. |
| `/stop` | Stop playback and leave the channel. |
| `/nowplaying`| Show detailed info about the current track. |
| `/queue` | Display the current music queue. |
| `/lyrics` | Fetch lyrics for the current song. |
| `/autoplay` | Toggle related video autoplay. |
| `/247` | Toggle 24/7 connection mode. |

## 🛠️ Tech Stack

- **Library**: `discord.js`
- **Audio**: `@discordjs/voice`, `play-dl`, `ffmpeg-static`
- **Database**: `better-sqlite3`
- **Lyrics**: `genius-lyrics`

## 📄 License

This project is licensed under the MIT License.
