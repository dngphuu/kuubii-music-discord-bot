import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Xem thông tin bài hát đang phát')
        .setDescriptionLocalizations({
            vi: 'Xem thông tin bài hát đang phát'
        }),
    async execute(interaction) {
        const queue = interaction.client.player.queues.get(interaction.guildId);

        if (!queue || !queue.currentTrack) {
            return interaction.reply({ content: '❌ Hiện không có bài hát nào đang phát!', ephemeral: true });
        }

        const track = queue.currentTrack;
        const embed = new EmbedBuilder()
            .setTitle('🎶 Đang phát')
            .setDescription(`[${track.title}](${track.url})`)
            .setThumbnail(track.thumbnail)
            .addFields(
                { name: 'Tác giả', value: track.author, inline: true },
                { name: 'Thời lượng', value: track.duration, inline: true },
                { name: 'Yêu cầu bởi', value: track.requestedBy?.toString() || 'Hệ thống', inline: true }
            )
            .setColor(config.colors.primary);

        await interaction.reply({ embeds: [embed] });
    },
};
