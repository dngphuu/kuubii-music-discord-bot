import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    NoSubscriberBehavior
} from '@discordjs/voice';
import play from 'play-dl';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { config } from '../../config.js';
import db from '../database/db.js';
import prism from 'prism-media';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'child_process';

class MusicQueue {
    constructor(guildId, client) {
        this.guildId = guildId;
        this.client = client;
        this.tracks = [];
        this.currentIndex = -1;
        this.loop = 'none'; // 'none', 'track', 'queue'
        this.autoplay = true;
        this.mode247 = false;
        this.filters = {
            bassboost: false,
            nightcore: false,
            vaporwave: false,
        };
        this.volume = config.music.defaultVolume;
        this.textChannel = null;
        this.voiceChannel = null;
        this.connection = null;
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });

        this.player.on(AudioPlayerStatus.Idle, () => this.onTrackEnd());
        this.player.on('error', error => console.error('Audio Player Error:', error));

        this.loadSettings();
    }

    async loadSettings() {
        try {
            const [rows] = await db.execute('SELECT * FROM server_settings WHERE guild_id = ?', [this.guildId]);
            const settings = rows[0];
            if (settings) {
                this.autoplay = !!settings.autoplay;
                this.mode247 = !!settings.mode_24_7;
                this.volume = settings.volume;
            } else {
                // Initialize default settings
                await db.execute('INSERT IGNORE INTO server_settings (guild_id) VALUES (?)', [this.guildId]);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveSettings() {
        try {
            await db.execute(
                'UPDATE server_settings SET autoplay = ?, mode_24_7 = ?, volume = ? WHERE guild_id = ?',
                [this.autoplay ? 1 : 0, this.mode247 ? 1 : 0, this.volume, this.guildId]
            );
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    get currentTrack() {
        return this.tracks[this.currentIndex];
    }

    addTrack(track, top = false) {
        if (top) {
            this.tracks.splice(this.currentIndex + 1, 0, track);
        } else {
            this.tracks.push(track);
        }
    }

    async play() {
        if (this.tracks.length === 0) return;

        if (this.currentIndex === -1) this.currentIndex = 0;
        const track = this.currentTrack;

        try {
            const stream = await play.stream(track.url);

            // Build FFmpeg filters
            let filterArgs = [];
            if (this.filters.bassboost) filterArgs.push('bass=g=10,dynaudnorm=f=200');
            if (this.filters.nightcore) filterArgs.push('atempo=1.06,asetrate=48000*1.25');
            if (this.filters.vaporwave) filterArgs.push('atempo=1,asetrate=48000*0.8');

            let finalStream;
            if (filterArgs.length > 0) {
                const ffmpegProcess = spawn(ffmpeg, [
                    '-i', '-',
                    '-af', filterArgs.join(','),
                    '-f', 's16le',
                    '-ar', '48000',
                    '-ac', '2',
                    '-'
                ], { stdio: ['pipe', 'pipe', 'ignore'] });

                stream.stream.pipe(ffmpegProcess.stdin);

                finalStream = new prism.opus.Encoder({
                    rate: 48000,
                    channels: 2,
                    frameSize: 960
                });

                ffmpegProcess.stdout.pipe(finalStream);
            } else {
                finalStream = stream.stream;
            }

            const resource = createAudioResource(finalStream, {
                inputType: filterArgs.length > 0 ? 'opus' : stream.type,
                inlineVolume: true
            });
            resource.volume.setVolume(this.volume / 100);

            this.player.play(resource);
            if (this.connection) {
                this.connection.subscribe(this.player);
            }

            this.sendNowPlaying(track);
        } catch (error) {
            console.error('Play error:', error);
            this.textChannel?.send('❌ Đã xảy ra lỗi khi phát nhạc.');
            this.skip();
        }
    }

    skip() {
        this.player.stop();
    }

    stop() {
        this.tracks = [];
        this.currentIndex = -1;
        this.player.stop();
        if (this.connection) {
            this.connection.destroy();
            this.connection = null;
        }
    }

    setVolume(volume) {
        this.volume = volume;
        if (this.player.state.status === AudioPlayerStatus.Playing) {
            const resource = this.player.state.resource;
            resource.volume?.setVolume(this.volume / 100);
        }
        this.saveSettings();
    }

    async onTrackEnd() {
        if (this.loop === 'track') {
            return this.play();
        }

        if (this.loop === 'queue') {
            this.currentIndex = (this.currentIndex + 1) % this.tracks.length;
            return this.play();
        }

        if (this.currentIndex < this.tracks.length - 1) {
            this.currentIndex++;
            return this.play();
        }

        if (this.autoplay) {
            return this.handleAutoplay();
        }

        if (this.mode247) {
            return; // Stay in channel
        }

        this.textChannel?.send('✅ Đã phát hết danh sách chờ.');
        // Optional: Stay for a while then leave
        setTimeout(() => {
            if (this.tracks.length === 0 && !this.mode247) {
                this.stop();
            }
        }, 300000); // 5 minutes
    }

    async handleAutoplay() {
        const lastTrack = this.tracks[this.tracks.length - 1];
        if (!lastTrack) return;

        try {
            const related = await play.video_info(lastTrack.url);
            const nextVideo = related.related_videos[0];

            if (nextVideo) {
                const track = {
                    title: nextVideo.title,
                    url: nextVideo.url,
                    thumbnail: nextVideo.thumbnails[0]?.url,
                    duration: nextVideo.durationRaw,
                    author: nextVideo.channel?.name,
                    requestedBy: this.client.user
                };
                this.addTrack(track);
                this.currentIndex++;
                this.play();
            }
        } catch (error) {
            console.error('Autoplay error:', error);
        }
    }

    sendNowPlaying(track) {
        const embed = new EmbedBuilder()
            .setTitle('🎶 Đang phát')
            .setDescription(`[${track.title}](${track.url})`)
            .setThumbnail(track.thumbnail)
            .addFields(
                { name: 'Thời lượng', value: track.duration, inline: true },
                { name: 'Yêu cầu bởi', value: track.requestedBy?.toString() || 'Hệ thống', inline: true }
            )
            .setColor(config.colors.primary);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('music_pause_resume')
                    .setEmoji(this.player.state.status === AudioPlayerStatus.Paused ? '▶️' : '⏸️')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('music_skip')
                    .setEmoji('⏭️')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('music_stop')
                    .setEmoji('⏹️')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('music_loop')
                    .setEmoji('🔁')
                    .setStyle(this.loop !== 'none' ? ButtonStyle.Primary : ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('music_shuffle')
                    .setEmoji('🔀')
                    .setStyle(ButtonStyle.Secondary)
            );

        this.textChannel?.send({ embeds: [embed], components: [row] });
    }
}

class PlayerManager {
    constructor(client) {
        this.client = client;
        this.queues = new Map();
    }

    getQueue(guildId) {
        let queue = this.queues.get(guildId);
        if (!queue) {
            queue = new MusicQueue(guildId, this.client);
            this.queues.set(guildId, queue);
        }
        return queue;
    }

    async join(voiceChannel, textChannel) {
        const queue = this.getQueue(voiceChannel.guild.id);
        await queue.loadSettings();
        queue.textChannel = textChannel;
        queue.voiceChannel = voiceChannel;

        queue.connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        queue.connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(queue.connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(queue.connection, VoiceConnectionStatus.Connecting, 5000),
                ]);
            } catch (error) {
                queue.stop();
            }
        });

        return queue;
    }
}

export default PlayerManager;
