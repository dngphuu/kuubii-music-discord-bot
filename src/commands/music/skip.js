import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Bỏ qua bài hát hiện tại')
        .setDescriptionLocalizations({
            vi: 'Bỏ qua bài hát hiện tại'
        }),
    async execute(interaction) {
        const queue = interaction.client.player.queues.get(interaction.guildId);

        if (!queue || !queue.currentTrack) {
            return interaction.reply({ content: '❌ Hiện không có bài hát nào đang phát!', ephemeral: true });
        }

        if (interaction.member.voice.channel?.id !== queue.voiceChannel?.id) {
            return interaction.reply({ content: '❌ Bạn cần ở cùng kênh thoại với tôi để sử dụng lệnh này!', ephemeral: true });
        }

        queue.skip();
        await interaction.reply('⏭️ Đã bỏ qua bài hát hiện tại.');
    },
};
