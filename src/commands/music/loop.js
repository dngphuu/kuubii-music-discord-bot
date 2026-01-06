import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Thay đổi chế độ lặp lại')
        .setDescriptionLocalizations({
            vi: 'Thay đổi chế độ lặp lại'
        })
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Chế độ lặp lại')
                .setRequired(true)
                .addChoices(
                    { name: 'Tắt', value: 'none' },
                    { name: 'Bài hát', value: 'track' },
                    { name: 'Danh sách', value: 'queue' }
                )),
    async execute(interaction) {
        const queue = interaction.client.player.queues.get(interaction.guildId);
        const mode = interaction.options.getString('mode');

        if (!queue) {
            return interaction.reply({ content: '❌ Hiện không có bài hát nào đang phát!', ephemeral: true });
        }

        queue.loop = mode;
        const modeNames = { none: 'Tắt', track: 'Bài hát', queue: 'Danh sách' };
        await interaction.reply(`🔁 Đã chuyển chế độ lặp lại sang: **${modeNames[mode]}**`);
    },
};
