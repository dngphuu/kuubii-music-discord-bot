import { Events, REST, Routes } from 'discord.js';
import { config } from '../config.js';

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        // Register Slash Commands
        const commands = [];
        client.commands.forEach(command => {
            commands.push(command.data.toJSON());
        });

        const rest = new REST({ version: '10' }).setToken(config.token);

        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);

            // Global commands (takes up to 1 hour to update)
            // await rest.put(Routes.applicationCommands(config.clientId), { body: commands });

            // Guild commands (instant update, good for development/private server)
            if (config.guildId) {
                const data = await rest.put(
                    Routes.applicationGuildCommands(config.clientId, config.guildId),
                    { body: commands },
                );
                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } else {
                console.warn('GUILD_ID is not defined in .env. Skipping guild command registration.');
            }
        } catch (error) {
            console.error(error);
        }
    },
};
