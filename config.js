import 'dotenv/config';

export const config = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    geniusApiKey: process.env.GENIUS_API_KEY,
    ownerId: process.env.OWNER_ID,
    database: {
        url: process.env.DATABASE_URL
    },
    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    },
    soundcloud: {
        clientId: process.env.SOUNDCLOUD_CLIENT_ID
    },

    // Embed Colors
    colors: {
        primary: '#5865F2', // Discord Blurple
        success: '#57F287',
        danger: '#ED4245',
        warning: '#FEE75C',
    },

    // Music Settings
    music: {
        maxQueueSize: 1000,
        defaultVolume: 50,
        liveLyrics: true,
        autoplay: true,
    }
};
