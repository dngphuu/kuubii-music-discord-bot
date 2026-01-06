import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Dừng phát nhạc và rời khỏi kênh thoại')
        .setDescriptionLocalizations({
            vi: 'Dừng phát nhạc và rời khỏi kênh thoại'
        }),
    async execute(interaction) {
        const queue = interaction.client.player.queues.get(interaction.guildId);

        if (!queue) {
            return interaction.reply({ content: '❌ Tôi không ở trong kênh thoại!', ephemeral: true });
        }

        if (interaction.member.voice.channel?.id !== queue.voiceChannel?.id) {
            return interaction.reply({ content: '❌ Bạn cần ở cùng kênh thoại với tôi để sử dụng lệnh này!', ephemeral: true });
        }

        queue.stop();
        await interaction.reply('⏹️ Đã dừng phát nhạc và rời khỏi kênh thoại.');
    },
};
