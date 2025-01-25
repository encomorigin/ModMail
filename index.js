require('dotenv').config();
const { Client, Intents } = require('discord.js');
const cooldowns = new Map();
const COOLDOWN_TIME = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

// Create a new Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.MESSAGE_CONTENT] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // Set bot status to "Watching Encom"
  client.user.setPresence({ activities: [{ name: 'Watching Encom' }], status: 'idle' });
});

// Role IDs for access
const ROLE_IDS = {
  Founder: 'your-founder-role-id',
  Maintainer: 'your-maintainer-role-id',
  Team: 'your-team-role-id',
  Moderator: 'your-moderator-role-id'
};

// Handle incoming messages
client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Ignore messages that are not DMs (no pings or messages in public channels)
  if (message.channel.type !== 'DM') {
    return message.reply("Please send your issues via DM to this bot.");
  }

  // Check if the sender has permission to use the bot
  if (!hasAccess(message.author)) {
    return message.reply('You do not have permission to interact with this bot.');
  }

  // Handle only DMs
  if (message.channel.type === 'DM') {
    // Check if the sender has already sent a message recently (cooldown system)
    if (isOnCooldown(message.author.id)) {
      return message.reply('You can only send a message every 3 hours.');
    }

    // Ask for language selection if it's their first message
    let lang = await getLanguageSelection(message);
    if (!lang) return;

    // Log the message and set the cooldown
    message.reply(`Thank you for your message! Team Encom will review it soon.`);
    setCooldown(message.author.id);

    // Send the message to a log channel for admins to review
    const logChannel = client.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (logChannel) {
      const modmailMessage = await logChannel.send(`New modmail from ${message.author.tag} (${lang}): \n${message.content}`);
      
      // Add approval and rejection reactions to the modmail message
      await modmailMessage.react('✅');
      await modmailMessage.react('❌');

      // Handle the reactions for approval/rejection
      const filter = (reaction, user) => {
        return [ '✅', '❌' ].includes(reaction.emoji.name) && hasAccess(user);
      };

      const collector = modmailMessage.createReactionCollector({ filter, time: 60000 });
      
      collector.on('collect', async (reaction, user) => {
        if (reaction.emoji.name === '✅') {
          await message.reply('Team Encom has accepted your request.');
        } else if (reaction.emoji.name === '❌') {
          await message.reply('Team Encom has rejected your request.');
        }

        // Log the action taken and the user who reacted
        const actionTaken = reaction.emoji.name === '✅' ? 'Accepted' : 'Rejected';
        const logAction = client.channels.cache.get(process.env.LOG_CHANNEL_ID);
        logAction.send(`Modmail from ${message.author.tag} was ${actionTaken} by ${user.tag} at ${new Date().toLocaleString()}.`);
      });
    } else {
      console.log('Log channel not found.');
    }
  }
});

// Check if user is on cooldown
function isOnCooldown(userId) {
  if (cooldowns.has(userId)) {
    const expirationTime = cooldowns.get(userId);
    if (Date.now() < expirationTime) {
      return true;
    }
    cooldowns.delete(userId); // Remove expired cooldown
  }
  return false;
}

// Set cooldown for user
function setCooldown(userId) {
  cooldowns.set(userId, Date.now() + COOLDOWN_TIME);
}

// Ask user to select a language
async function getLanguageSelection(message) {
  const langEmbed = {
    color: 0x0099ff,
    title: 'Please select your preferred language',
    description: 'React with the corresponding emoji to select your language.',
    fields: [
      { name: 'English', value: '🇬🇧' },
      { name: 'Telugu', value: '🇮🇳' },
      { name: 'Hindi', value: '🇮🇳' },
      { name: 'French', value: '🇫🇷' },
      { name: 'Russian', value: '🇷🇺' },
      { name: 'Arabic', value: '🇸🇦' },
      { name: 'German', value: '🇩🇪' },
    ],
  };

  await message.reply({ embeds: [langEmbed] });

  const filter = (reaction, user) => {
    return user.id === message.author.id && ["🇬🇧", "🇮🇳", "🇫🇷", "🇷🇺", "🇸🇦", "🇩🇪"].includes(reaction.emoji.name);
  };

  // Wait for user to react
  const collected = await message.awaitReactions({ filter, max: 1, time: 60000 });
  const selectedLanguage = collected.first() ? collected.first().emoji.name : null;

  if (!selectedLanguage) {
    message.reply('You did not select a language in time. Please try again.');
    return null;
  }

  // Return the selected language
  switch (selectedLanguage) {
    case '🇬🇧':
      return 'English';
    case '🇮🇳':
      return 'Telugu/Hindi';
    case '🇫🇷':
      return 'French';
    case '🇷🇺':
      return 'Russian';
    case '🇸🇦':
      return 'Arabic';
    case '🇩🇪':
      return 'German';
    default:
      return 'English';
  }
}

// Check if the user has permission to access the bot
function hasAccess(user) {
  // Check if the user has any of the allowed roles by their ID
  const allowedRoleIds = Object.values(ROLE_IDS);
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return false;
  
  const member = guild.members.cache.get(user.id);
  if (!member) return false;

  return member.roles.cache.some(role => allowedRoleIds.includes(role.id));
}

// Login to Discord with your app's token
client.login(process.env.BOT_TOKEN);
