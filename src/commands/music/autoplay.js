import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Bật/Tắt chế độ tự động phát nhạc liên quan')
        .setDescriptionLocalizations({
            vi: 'Bật/Tắt chế độ tự động phát nhạc liên quan'
        }),
    async execute(interaction) {
        const queue = interaction.client.player.queues.get(interaction.guildId);

        if (!queue) {
            return interaction.reply({ content: '❌ Hiện không có bài hát nào đang phát!', ephemeral: true });
        }

        queue.autoplay = !queue.autoplay;
        await queue.saveSettings();
        await interaction.reply(`📻 Đã **${queue.autoplay ? 'Bật' : 'Tắt'}** chế độ tự động phát.`);
    },
};
