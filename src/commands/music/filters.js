import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('filters')
        .setDescription('Bật/Tắt các bộ lọc âm thanh')
        .setDescriptionLocalizations({
            vi: 'Bật/Tắt các bộ lọc âm thanh'
        })
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('Chọn bộ lọc')
                .setRequired(true)
                .addChoices(
                    { name: 'Tắt hết', value: 'off' },
                    { name: 'Bassboost', value: 'bassboost' },
                    { name: 'Nightcore', value: 'nightcore' },
                    { name: 'Vaporwave', value: 'vaporwave' }
                )),
    async execute(interaction) {
        const queue = interaction.client.player.queues.get(interaction.guildId);
        const filter = interaction.options.getString('filter');

        if (!queue || !queue.currentTrack) {
            return interaction.reply({ content: '❌ Hiện không có bài hát nào đang phát!', ephemeral: true });
        }

        if (filter === 'off') {
            queue.filters = { bassboost: false, nightcore: false, vaporwave: false };
            await interaction.reply('✨ Đã tắt tất cả bộ lọc âm thanh.');
        } else {
            queue.filters[filter] = !queue.filters[filter];
            const filterNames = { bassboost: 'Bassboost', nightcore: 'Nightcore', vaporwave: 'Vaporwave' };
            await interaction.reply(`🎧 Đã **${queue.filters[filter] ? 'Bật' : 'Tắt'}** bộ lọc: **${filterNames[filter]}**`);
        }

        // Restart current track with new filter if playing
        if (queue.currentTrack) {
            queue.play();
        }
    },
};
