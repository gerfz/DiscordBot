require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const schedule = require('./schedule');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Helper to delay if needed, though we update once an hour so rate limits shouldn't be hit
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const getMapConfig = () => ({
    dam: { displayName: 'Dam', id: process.env.CHANNEL_ID_DAM },
    buried: { displayName: 'Buried City', id: process.env.CHANNEL_ID_BURIED },
    space: { displayName: 'Space Port', id: process.env.CHANNEL_ID_SPACE },
    blue: { displayName: 'Blue Gate', id: process.env.CHANNEL_ID_BLUE }
});

async function updateChannels() {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const currentSchedule = schedule[utcHour];

    if (!currentSchedule) {
        console.error(`No schedule found for hour ${utcHour}`);
        return;
    }

    console.log(`Updating channels for UTC hour: ${utcHour}:00`);

    const mapConfig = getMapConfig();
    
    for (const [key, config] of Object.entries(mapConfig)) {
        // Debug log to verify ID is present
        console.log(`Processing ${key}... (ID: ${config.id ? 'Present' : 'MISSING'})`);

        if (!config.id) {
            console.warn(`Missing Channel ID for ${key} in .env file`);
            continue;
        }

        try {
            const channel = await client.channels.fetch(config.id);
            if (!channel) {
                console.error(`Channel not found for ${key} (ID: ${config.id})`);
                continue;
            }

            const events = currentSchedule[key] || [];
            let newName = config.displayName;

            if (events.length > 0) {
                // Format: "Map Name - Event1 | Event2"
                newName = `${config.displayName} - ${events.join(' | ')}`;
            } else {
                // If no events, find the next one
                let nextEventTime = null;
                let nextEventName = null;
                
                // Look ahead up to 24 hours
                for (let i = 1; i < 24; i++) {
                    const checkHour = (utcHour + i) % 24;
                    const futureEvents = schedule[checkHour][key];
                    
                    if (futureEvents && futureEvents.length > 0) {
                        // Found the next event!
                        // Convert to Requested Timezone (UTC+2)
                        const displayHour = (checkHour + 2) % 24;
                        const formattedHour = displayHour.toString().padStart(2, '0');
                        nextEventTime = `${formattedHour}:00`;
                        nextEventName = futureEvents.join(' | ');
                        break;
                    }
                }

                if (nextEventTime && nextEventName) {
                    // Example: "Dam - Next: Matriarch (20:00)"
                    newName = `${config.displayName} - Next: ${nextEventName} (${nextEventTime})`;
                } else {
                    newName = config.displayName;
                }
            }

            if (channel.name !== newName) {
                await channel.setName(newName);
                console.log(`Updated ${key} channel to: "${newName}"`);
            } else {
                console.log(`${key} channel already named "${newName}", skipping.`);
            }
        } catch (error) {
            console.error(`Failed to update channel for ${key}:`, error);
        }
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Run immediately on startup
    await updateChannels();

    // Schedule cron to run at the start of every hour
    cron.schedule('0 * * * *', async () => {
        await updateChannels();
    });
});

client.login(process.env.DISCORD_TOKEN);

