import play from 'play-dl';
import { config } from '../../config.js';

class MusicInitializer {
    static async init() {
        try {
            const spotifyOptions = {};

            if (config.spotify.clientId && config.spotify.clientSecret) {
                spotifyOptions.client_id = config.spotify.clientId;
                spotifyOptions.client_secret = config.spotify.clientSecret;
                spotifyOptions.refresh_token = null; // Will be obtained automatically if valid credentials provided
                spotifyOptions.market = 'US';
            }

            const soundcloudOptions = {};
            if (config.soundcloud.clientId) {
                soundcloudOptions.client_id = config.soundcloud.clientId;
            }

            await play.setToken({
                spotify: Object.keys(spotifyOptions).length > 0 ? spotifyOptions : undefined,
                soundcloud: Object.keys(soundcloudOptions).length > 0 ? soundcloudOptions : undefined
            });

            console.log('✅ Music services initialized (Spotify/SoundCloud)');
        } catch (error) {
            console.error('❌ Error initializing music services:', error);
        }
    }
}

export default MusicInitializer;
