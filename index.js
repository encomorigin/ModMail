const { Client, GatewayIntentBits, Partials } = require('discord.js');
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Hardcoded IDs for the server and log channel
const GUILD_ID = process.env.GUILD_ID;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
const ANTI_RAID_CHANNEL_ID = process.env.ANTI_RAID_CHANNEL_ID;
const COOLDOWN_TIME = process.env.COOLDOWN_TIME; // 3 hours in seconds
const LANGUAGE_DEFAULT = process.env.LANGUAGE_DEFAULT;

// Role IDs for Founder, Maintainer, Team, and Moderator
const ALLOWED_ROLES = [
  'FounderRoleID',    // Replace with the actual role ID for Founder
  'MaintainerRoleID', // Replace with the actual role ID for Maintainer
  'TeamRoleID',       // Replace with the actual role ID for Team
  'ModeratorRoleID'   // Replace with the actual role ID for Moderator
];

const cooldowns = new Map();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setStatus('idle'); // Set bot status to idle mode

  setInterval(() => {
    const statuses = [
      'Watching Encom',
      'Playing with Encom',
      'Helping Encom'
    ];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setActivity(randomStatus, { type: 'PLAYING' });
  }, 3000); // Rotates every 3 seconds
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Anti-spam check for harmful content
  const harmfulLinks = ['facebook.com', 'youtube.com', 'discord.gg'];
  if (harmfulLinks.some(link => message.content.includes(link)) || message.attachments.size > 0) {
    if (!message.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id))) {
      await message.delete();
      await message.member.timeout(12 * 60 * 60 * 1000, 'Posting harmful content');
      return message.reply('Your message has been deleted due to harmful content and you have been temporarily muted for 12 hours.');
    }
  }

  // Handle Modmail via DM
  if (message.channel.type === 'DM') {
    const userId = message.author.id;
    if (cooldowns.has(userId) && cooldowns.get(userId) > Date.now()) {
      const cooldownTimeLeft = Math.ceil((cooldowns.get(userId) - Date.now()) / 1000);
      return message.reply(`You can send another request in ${cooldownTimeLeft} seconds.`);
    }

    // Set Cooldown for the User
    cooldowns.set(userId, Date.now() + COOLDOWN_TIME * 1000);

    // Send modmail to a staff-only channel
    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    const embed = {
      title: `Modmail from ${message.author.tag}`,
      description: message.content,
      footer: { text: `User ID: ${message.author.id} | Time: ${moment().format('YYYY-MM-DD HH:mm:ss')}` },
    };

    const sentMessage = await logChannel.send({ embeds: [embed] });

    // Add reaction buttons for staff (✅ & ❌)
    await sentMessage.react('✅');
    await sentMessage.react('❌');

    // Await staff reactions for approval/rejection
    const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && message.guild.members.cache.get(user.id).roles.cache.some(role => ALLOWED_ROLES.includes(role.id));
    const collected = await sentMessage.awaitReactions({ filter, max: 1, time: 60000 });

    const reaction = collected.first();
    let replyMessage;
    if (reaction.emoji.name === '✅') {
      replyMessage = 'Team Encom has accepted your request.';
    } else {
      replyMessage = 'Team Encom has rejected your request.';
    }

    // Send a DM to the user notifying them of the decision
    try {
      await message.author.send(replyMessage);
    } catch (err) {
      console.error('Could not send DM to user:', err);
    }

    // Log the action with staff details and timestamp
    logChannel.send(`Modmail from ${message.author.tag} [ID: ${message.author.id}]: ${reaction.emoji.name === '✅' ? 'Accepted' : 'Rejected'} by ${reaction.users.cache.last().tag} at ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
