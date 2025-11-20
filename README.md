# Discord Map Schedule Bot

This bot automatically updates voice channel names to reflect the current map events based on a UTC schedule.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a file named `.env` in the root directory and add your Discord Bot Token and Channel IDs:

   ```env
   DISCORD_TOKEN=your_bot_token_here
   CHANNEL_ID_DAM=123456789012345678
   CHANNEL_ID_BURIED=123456789012345678
   CHANNEL_ID_SPACE=123456789012345678
   CHANNEL_ID_BLUE=123456789012345678
   ```

   *You can get Channel IDs by enabling "Developer Mode" in Discord settings (Advanced > Developer Mode), then right-clicking a channel and selecting "Copy ID".*

3. **Run the Bot**
   ```bash
   node index.js
   ```

## Schedule
The schedule is hardcoded in `schedule.js` and corresponds to the UTC time events.

