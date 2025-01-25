const { Client, Intents } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.MESSAGE_CONTENT] });

// Data storage (this could be in a database, but for simplicity, we use an in-memory object)
let warnings = {};
let recentJoins = [];
let recentMessages = [];
let recentRoleChanges = [];
const raidDetection = {
    recentJoins: [],
    recentMessages: [],
    recentRoleChanges: [],
    raidThreshold: 5, 
    raidTimeWindow: 600000, 
};

const activities = [
    "Watching Encom",
    "Playing Encom",
    "Helping Encom"
];

// Function to rotate the bot's status every 3 seconds
let activityIndex = 0;
setInterval(() => {
    client.user.setActivity(activities[activityIndex], { type: 'WATCHING' });
    activityIndex = (activityIndex + 1) % activities.length; // Rotate through activities
}, 3000);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setStatus('idle');
});

// Handle member joins
client.on('guildMemberAdd', (member) => {
    recentJoins.push(Date.now());
    recentJoins = recentJoins.filter(timestamp => Date.now() - timestamp < raidDetection.raidTimeWindow);

    if (recentJoins.length > raidDetection.raidThreshold) {
        handleRaid('join');
    }
});

// Handle message events to detect spamming
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Anti-spam: Check if the message contains unwanted content
    const restrictedLinks = ['youtube.com', 'facebook.com', 'instagram.com', 'discord.gg', '.pdf', '.exe', 'hack'];
    if (restrictedLinks.some(link => message.content.includes(link) || message.attachments.size > 0)) {
        await message.author.send('You have posted a restricted link/image. You will be timed out for 12 hours.');
        await message.member.timeout(43200 * 1000); // Timeout for 12 hours
    }

    // Monitor messages for raid detection
    recentMessages.push(Date.now());
    recentMessages = recentMessages.filter(timestamp => Date.now() - timestamp < raidDetection.raidTimeWindow);

    if (recentMessages.length > raidDetection.raidThreshold) {
        handleRaid('message');
    }

    // Command handling
    if (message.content === '!help') {
        return message.author.send('Please DM me for administrative server help');
    }

    if (message.content === '!lockdown') {
        await lockdownServer();
    }

    // Modmail system
    if (message.content.startsWith('!modmail')) {
        message.author.send('Please select your language: English, Telugu, Hindi, French, Russian, Arabic, German');
        message.author.send('Now, please send your message for Team Encom.');

        const modmailChannel = client.channels.cache.get(process.env.MODMAIL_CHANNEL_ID);
        modmailChannel.send(`New modmail from ${message.author.tag}: ${message.content}`);

        // Timeout logic
        if (message.content.includes('!modmail')) {
            await message.member.timeout(300000); // Timeout for 5 minutes
            await message.author.send("Please don't misuse the commands, or you'll be banned.");
        }
    }

    // Handle approval or rejection of messages (only for assigned roles)
    const approvedReactions = ['✅', '❌'];
    if (approvedReactions.includes(message.content)) {
        const response = message.content === '✅' 
            ? 'Your message was reviewed by Team Encom and accepted.' 
            : 'Your message was reviewed by Team Encom and not accepted.';
        await message.author.send(response);
    }

    // Warning and ban system
    if (warnings[message.author.id] && warnings[message.author.id] >= 3) {
        await message.guild.members.ban(message.author.id, { reason: '3 warnings accumulated' });
        await message.author.send('You have been banned for 3 days due to 3 warnings.');
    }
});

// Handle role changes
client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        recentRoleChanges.push(Date.now());
        recentRoleChanges = recentRoleChanges.filter(timestamp => Date.now() - timestamp < raidDetection.raidTimeWindow);

        if (recentRoleChanges.length > raidDetection.raidThreshold) {
            handleRaid('role');
        }
    }
});

// Function to handle raid alerts
async function handleRaid(type) {
    const modmailChannel = client.channels.cache.get(process.env.MODMAIL_CHANNEL_ID);
    if (modmailChannel) {
        modmailChannel.send(`Raid detected through ${type} activity. Immediate action required!`);
    }

    const staffRole = process.env.FOUNDER_ROLE_ID; 
    const staffMembers = modmailChannel.guild.members.cache.filter(member => member.roles.cache.has(staffRole));
    staffMembers.forEach(staffMember => {
        staffMember.send(`Raid attempt detected via ${type}. Please investigate immediately.`);
    });

    // Lockdown
    await lockdownServer();
}

// Lockdown function (e.g., disabling messaging and connecting)
async function lockdownServer() {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    await guild.roles.everyone.setPermissions({
        SEND_MESSAGES: false,
        CONNECT: false,
    });
}

client.login(process.env.DISCORD_TOKEN);
