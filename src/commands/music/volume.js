import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Điều chỉnh âm lượng của bot')
        .setDescriptionLocalizations({
            vi: 'Điều chỉnh âm lượng của bot'
        })
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Mức âm lượng (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),
    async execute(interaction) {
        const queue = interaction.client.player.queues.get(interaction.guildId);
        const volume = interaction.options.getInteger('amount');

        if (!queue) {
            return interaction.reply({ content: '❌ Hiện không có bài hát nào đang phát!', ephemeral: true });
        }

        queue.setVolume(volume);
        await interaction.reply(`🔊 Đã chỉnh âm lượng lên: **${volume}%**`);
    },
};
