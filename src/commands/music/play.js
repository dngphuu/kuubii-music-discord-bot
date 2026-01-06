import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import play from 'play-dl';
import { config } from '../../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Tìm kiếm và phát nhạc từ YouTube, Spotify, hoặc SoundCloud')
        .setDescriptionLocalizations({
            vi: 'Tìm kiếm và phát nhạc từ YouTube, Spotify, hoặc SoundCloud'
        })
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Tên bài hát hoặc đường dẫn (URL)')
                .setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                content: '❌ Bạn cần tham gia một kênh thoại để sử dụng lệnh này!',
                ephemeral: true
            });
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return interaction.reply({
                content: '❌ Tôi không có quyền tham gia hoặc nói trong kênh thoại của bạn!',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            let trackInfo = null;
            let tracksToAdd = [];

            // Identify source
            const type = await play.validate(query);

            if (type === 'yt_video' || type === 'yt_playlist') {
                if (type === 'yt_video') {
                    const video = await play.video_info(query);
                    tracksToAdd.push(this.formatTrack(video.video_details, interaction.user));
                } else {
                    const playlist = await play.playlist_info(query, { incomplete: true });
                    const videos = await playlist.all_videos();
                    videos.forEach(v => tracksToAdd.push(this.formatTrack(v, interaction.user)));
                    trackInfo = { title: playlist.title, url: playlist.url, count: videos.length };
                }
            } else if (type === 'sp_track' || type === 'sp_playlist' || type === 'sp_album') {
                if (play.is_expired()) await play.refreshToken();
                const spData = await play.spotify(query);
                if (type === 'sp_track') {
                    const searched = await play.search(`${spData.name} ${spData.artists[0].name}`, { limit: 1 });
                    if (searched.length > 0) {
                        tracksToAdd.push(this.formatTrack(searched[0], interaction.user));
                    }
                } else {
                    const spTracks = await spData.all_tracks();
                    for (const t of spTracks) {
                        const searched = await play.search(`${t.name} ${t.artists[0].name}`, { limit: 1 });
                        if (searched.length > 0) {
                            tracksToAdd.push(this.formatTrack(searched[0], interaction.user));
                        }
                    }
                    trackInfo = { title: spData.name, url: spData.url, count: spTracks.length };
                }
            } else if (type === 'so_track' || type === 'so_playlist') {
                const soData = await play.soundcloud(query);
                if (type === 'so_track') {
                    tracksToAdd.push(this.formatTrack(soData, interaction.user));
                } else {
                    const soTracks = await soData.all_tracks();
                    soTracks.forEach(t => tracksToAdd.push(this.formatTrack(t, interaction.user)));
                    trackInfo = { title: soData.name, url: soData.url, count: soTracks.length };
                }
            } else {
                // Search fallback
                const searched = await play.search(query, { limit: 1 });
                if (searched.length > 0) {
                    tracksToAdd.push(this.formatTrack(searched[0], interaction.user));
                }
            }

            if (tracksToAdd.length === 0) {
                return interaction.editReply('❌ Không tìm thấy kết quả phù hợp!');
            }

            const queue = await interaction.client.player.join(voiceChannel, interaction.channel);

            tracksToAdd.forEach(track => queue.addTrack(track));

            if (queue.currentIndex === -1) {
                await queue.play();
                // Response is handled by sendNowPlaying in PlayerManager
                // But we still need to fulfill the interaction
                await interaction.editReply(`🎶 Đã thêm ${tracksToAdd.length} bài hát vào danh sách.`);
            } else {
                const first = tracksToAdd[0];
                const embed = new EmbedBuilder()
                    .setTitle('➕ Đã thêm vào danh sách')
                    .setDescription(`[${trackInfo ? trackInfo.title : first.title}](${trackInfo ? trackInfo.url : first.url})`)
                    .setThumbnail(first.thumbnail)
                    .addFields(
                        { name: 'Số lượng', value: tracksToAdd.length.toString(), inline: true },
                        { name: 'Vị trí', value: (queue.tracks.length - tracksToAdd.length + 1).toString(), inline: true }
                    )
                    .setColor(config.colors.success);

                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Đã xảy ra lỗi khi xử lý bài hát!');
        }
    },

    formatTrack(video, user) {
        return {
            title: video.title,
            url: video.url,
            thumbnail: video.thumbnails[0]?.url || video.thumbnail?.url,
            duration: video.durationRaw || `${Math.floor(video.durationInSec / 60)}:${(video.durationInSec % 60).toString().padStart(2, '0')}`,
            author: video.channel?.name || video.publisher?.artist || 'Unknown',
            requestedBy: user
        };
    }
};
