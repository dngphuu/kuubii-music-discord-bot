import { Events, Collection } from 'discord.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isButton()) {
            return this.handleButton(interaction);
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        const { cooldowns } = interaction.client;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                return interaction.reply({
                    content: `Vui lòng chờ. Bạn có thể sử dụng lại lệnh \`${command.data.name}\` sau <t:${expiredTimestamp}:R>.`,
                    ephemeral: true
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const errorMessage = {
                content: '❌ Đã có lỗi xảy ra khi thực hiện lệnh này!',
                ephemeral: true
            };
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },

    async handleButton(interaction) {
        const queue = interaction.client.player.queues.get(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không tìm thấy thông tin phòng chờ!', ephemeral: true });

        if (interaction.member.voice.channel?.id !== queue.voiceChannel?.id) {
            return interaction.reply({ content: '❌ Bạn cần ở cùng kênh thoại với tôi!', ephemeral: true });
        }

        switch (interaction.customId) {
            case 'music_pause_resume':
                if (queue.player.state.status === 'paused') {
                    queue.player.unpause();
                    await interaction.reply({ content: '▶️ Đã tiếp tục phát nhạc.', ephemeral: true });
                } else {
                    queue.player.pause();
                    await interaction.reply({ content: '⏸️ Đã tạm dừng phát nhạc.', ephemeral: true });
                }
                break;
            case 'music_skip':
                queue.skip();
                await interaction.reply({ content: '⏭️ Đã bỏ qua bài hát.', ephemeral: true });
                break;
            case 'music_stop':
                queue.stop();
                await interaction.reply({ content: '⏹️ Đã dừng phát nhạc.', ephemeral: true });
                break;
            case 'music_loop':
                const cycles = ['none', 'track', 'queue'];
                const currentIdx = cycles.indexOf(queue.loop);
                queue.loop = cycles[(currentIdx + 1) % cycles.length];
                await queue.saveSettings();
                const loopNames = { none: 'Tắt', track: 'Bài hát', queue: 'Danh sách' };
                await interaction.reply({ content: `🔁 Chế độ lặp: **${loopNames[queue.loop]}**`, ephemeral: true });
                break;
            case 'music_shuffle':
                if (queue.tracks.length <= 1) {
                    await interaction.reply({ content: '❌ Không đủ bài hát để xáo trộn!', ephemeral: true });
                } else {
                    // Reuse shuffle logic here or move to MusicQueue
                    this.shuffleQueue(queue);
                    await interaction.reply({ content: '🔀 Đã xáo trộn danh sách.', ephemeral: true });
                }
                break;
        }
    },

    shuffleQueue(queue) {
        const currentTrack = queue.tracks.splice(queue.currentIndex, 1)[0];
        for (let i = queue.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue.tracks[i], queue.tracks[j]] = [queue.tracks[j], queue.tracks[i]];
        }
        queue.tracks.unshift(currentTrack);
        queue.currentIndex = 0;
    }
};
