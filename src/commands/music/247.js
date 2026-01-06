import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('247')
        .setDescription('Bật/Tắt chế độ 24/7 (Bot luôn ở trong kênh thoại)')
        .setDescriptionLocalizations({
            vi: 'Bật/Tắt chế độ 24/7 (Bot luôn ở trong kênh thoại)'
        }),
    async execute(interaction) {
        const queue = interaction.client.player.queues.get(interaction.guildId);

        if (!queue) {
            return interaction.reply({ content: '❌ Hãy mời bot vào kênh thoại trước bằng lệnh `/play`!', ephemeral: true });
        }

        queue.mode247 = !queue.mode247;
        await queue.saveSettings();
        await interaction.reply(`♾️ Đã **${queue.mode247 ? 'Bật' : 'Tắt'}** chế độ 24/7.`);
    },
};
