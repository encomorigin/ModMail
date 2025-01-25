# Encom Modmail Bot

A Discord bot built using `discord.js` and `next.js` for handling modmail requests and providing server security. The bot also ensures the server is protected from harmful content (nudity, malware, PDFs, links, etc.) and allows only specific roles to handle modmail.

## Features:
- **Modmail System**: Members can send modmail via direct messages to the bot, which are then forwarded to a designated log channel.
- **Role-based Access**: Only users with the roles `Founder`, `Maintainer`, `Team`, and `Moderator` can accept or reject modmail messages.
- **Security**: Prevents users from sending harmful content like nudity, malware, hack PDFs, and dangerous links. Harmful content results in an automatic deletion and a 12-hour timeout for the user.
- **Cooldown**: Users can only send modmail requests once every 3 hours to prevent spam.
- **Bot Status**: The bot’s status is set to **idle** mode.
- **Rotating Status**: Every 3 seconds, the bot’s status changes between "Watching Encom", "Playing with Encom", and "Helping Encom".
- **Multilingual Support**: The bot can be configured to handle multiple languages. When a modmail request is sent, a translation option in English will be provided.
- **User Notification**: After staff reacts to a modmail request (with ✅ or ❌), the user is notified via direct message.

## Requirements:
- **Node.js**: v16.0.0 or higher.
- **Discord.js**: v14.0.0 or higher.
- **dotenv**: For environment variable management.

## Setup Instructions

### 1. Install Dependencies
To set up the bot, clone this repository and install the required dependencies:

```bash
git clone https://github.com/encomorigin/ModMail.git
cd encom-mm
npm install
