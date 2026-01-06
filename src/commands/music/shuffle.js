import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Xáo trộn danh sách chờ')
        .setDescriptionLocalizations({
            vi: 'Xáo trộn danh sách chờ'
        }),
    async execute(interaction) {
        const queue = interaction.client.player.queues.get(interaction.guildId);

        if (!queue || queue.tracks.length <= 1) {
            return interaction.reply({ content: '❌ Không đủ bài hát trong danh sách để xáo trộn!', ephemeral: true });
        }

        const currentTrack = queue.tracks.splice(queue.currentIndex, 1)[0];

        // Fisher-Yates shuffle
        for (let i = queue.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue.tracks[i], queue.tracks[j]] = [queue.tracks[j], queue.tracks[i]];
        }

        queue.tracks.unshift(currentTrack);
        queue.currentIndex = 0;

        await interaction.reply('🔀 Đã xáo trộn danh sách chờ.');
    },
};
