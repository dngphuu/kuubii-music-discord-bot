import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Client } from 'genius-lyrics';
import { config } from '../../config.js';

const genius = new Client(config.geniusApiKey);

export default {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Xem lời bài hát hiện tại hoặc tìm kiếm')
        .setDescriptionLocalizations({
            vi: 'Xem lời bài hát hiện tại hoặc tìm kiếm'
        })
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Tên bài hát cần tìm lời')
                .setRequired(false)),
    async execute(interaction) {
        let query = interaction.options.getString('query');
        const queue = interaction.client.player.queues.get(interaction.guildId);

        if (!query) {
            if (!queue || !queue.currentTrack) {
                return interaction.reply({ content: '❌ Hiện không có bài hát nào đang phát. Hãy cung cấp tên bài hát!', ephemeral: true });
            }
            query = queue.currentTrack.title;
        }

        await interaction.deferReply();

        try {
            const searches = await genius.songs.search(query);
            if (searches.length === 0) {
                return interaction.editReply(`❌ Không tìm thấy lời bài hát cho: \`${query}\``);
            }

            const song = searches[0];
            const lyrics = await song.lyrics();

            const embed = new EmbedBuilder()
                .setTitle(`Lời bài hát: ${song.title}`)
                .setAuthor({ name: song.artist.name, iconURL: song.artist.image })
                .setThumbnail(song.image)
                .setDescription(lyrics.length > 4096 ? lyrics.substring(0, 4090) + '...' : lyrics)
                .setColor(config.colors.primary)
                .setFooter({ text: 'Cung cấp bởi Genius' });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Đã xảy ra lỗi khi tìm lời bài hát!');
        }
    },
};
