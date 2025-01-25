# Discord Modmail Bot

## Features
- **Secure Server**: Anti-raid protection, role-based command restrictions.
- **Modmail System**: Users can send requests via DM, staff can approve/reject with reactions (✅ & ❌).
- **Content Filter**: Automatically deletes harmful content (nudity, malware, PDFs, hack videos, etc.).
- **Rotating Status**: Bot status changes every 3 seconds.
- **Multilingual**: Supports multiple languages with user preferences.
- **Logging**: Modmail requests are logged with staff member and timestamp.
- **Cooldown**: Limits how often users can send modmail requests to prevent spam.

## Installation
1. Clone this repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file with your bot's token, server ID, and other configuration details.
4. Run the bot with `node index.js`.

## Configuration (.env)
- `DISCORD_TOKEN`: Your bot's token.
- `GUILD_ID`: Your server ID.
- `LOG_CHANNEL_ID`: Channel for logging modmail actions.
- `MODMAIL_CHANNEL_ID`: Channel for receiving modmail requests.
- `ANTI_RAID_CHANNEL_ID`: Optional anti-raid monitoring channel.
- `COOLDOWN_TIME`: Cooldown duration in seconds for modmail requests.
- `LANGUAGE_DEFAULT`: Default language for users.

## License
This bot is licensed under MIT.
