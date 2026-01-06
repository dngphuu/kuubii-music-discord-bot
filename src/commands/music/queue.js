import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { config } from '../../config.js';

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Xem danh sách chờ hiện tại')
        .setDescriptionLocalizations({
            vi: 'Xem danh sách chờ hiện tại'
        }),
    async execute(interaction) {
        const queue = interaction.client.player.queues.get(interaction.guildId);

        if (!queue || queue.tracks.length === 0) {
            return interaction.reply({ content: '❌ Danh sách chờ hiện đang trống!', ephemeral: true });
        }

        const currentTrack = queue.currentTrack;
        const tracks = queue.tracks.slice(queue.currentIndex + 1, queue.currentIndex + 11); // Show next 10

        const embed = new EmbedBuilder()
            .setTitle(`Phòng chờ nhạc - ${interaction.guild.name}`)
            .setColor(config.colors.primary)
            .setDescription(`**Đang phát:** [${currentTrack.title}](${currentTrack.url})\n\n**Tiếp theo:**\n${tracks.length > 0
                    ? tracks.map((t, i) => `${i + 1}. [${t.title}](${t.url}) - \`${t.duration}\``).join('\n')
                    : 'Trống'
                }`)
            .setFooter({ text: `Tổng cộng: ${queue.tracks.length} bài hát • Lặp lại: ${queue.loop}` });

        await interaction.reply({ embeds: [embed] });
    },
};
