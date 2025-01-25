# Modmail Bot for Encom Discord Server

This is a modmail bot for Discord built using `discord.js` and `Next.js`. It allows users to send messages directly to the bot via DMs. The bot requires the user to select their preferred language before sending their message for review. The bot also has a cooldown system, so users can only send messages once every 3 hours.

## Features

- **Direct Messages Only**: The bot only responds to messages sent in DMs. Public mentions or messages will be ignored.
- **Cooldown System**: Users can only send a message every 3 hours.
- **Language Selection**: The bot will prompt users to select a language before they can send their message for review.
- **Role-based Approval**: Only users with specific roles (Founder, Maintainer, Team, Moderator) can approve or reject the messages using reactions (✅, ❌).
- **Bot Status**: The bot shows the status "Watching Encom".

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/modmail-bot.git
    ```

2. **Install dependencies**:
    ```bash
    cd modmail-bot
    npm install
    ```

3. **Set up your `.env` file**:
    Create a `.env` file in the root directory of the bot and add the following variables:
    ```env
    BOT_TOKEN=your-bot-token
    LOG_CHANNEL_ID=your-log-channel-id
    GUILD_ID=your-guild-id
    ```

    - `BOT_TOKEN`: Your Discord bot's token.
    - `LOG_CHANNEL_ID`: The channel ID where modmail messages will be logged for review.
    - `GUILD_ID`: The ID of your server where the bot is deployed.

4. **Start the bot**:
    Run the following command to start the bot:
    ```bash
    npm start
    ```

## Usage

- **Users**: Can DM the bot with their issues. The bot will ask them to select a language, and after selecting, they can send their message for review.
- **Admins (Founder, Maintainer, Team, Moderator)**: Can approve or reject the messages using reactions (✅ for accept, ❌ for reject). The action will be logged in the designated log channel.

## Roles

The following roles are required to approve or reject messages:

- **Founder**
- **Maintainer**
- **Team**
- **Moderator**

Only members with these roles can react to messages with the appropriate emoji (✅, ❌).

## License

This project is licensed under the MIT License.

## Credits

Built with [discord.js](https://discord.js.org/) and [dotenv](https://www.npmjs.com/package/dotenv).

