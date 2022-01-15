const { Client, Intents}  = require('discord.js');

const INTENTS = ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILD_SCHEDULED_EVENTS", "DIRECT_MESSAGES", "GUILD_INTEGRATIONS"]
const TOKEN = process.env.UBERBOT_DISCORD_TOKEN;
const LEADER_THRESHOLD = 2;
const DISCONNECT_MESSAGE = "There must be at least 2 leaders in a voice channel for you to join.";

const client = new Client({ intents: INTENTS });

// Init
client.on('ready', () => {
    console.log('UberBot is online!');
});

// Logic

// Don't allow campers to join rooms without two or more leaders.
client.on('voiceStateUpdate', function (oldState, newState) {
    if (newState === null) return;
    if (newState.channel === null) return;
    if (isLeader(newState.member)) return; //Let all leaders through
    if (leadersInChannel(newState.channel).length < 2) {
        newState.member.send(DISCONNECT_MESSAGE);
        newState.disconnect(DISCONNECT_MESSAGE);
    }
});

// If leader leaves room, and there are less than 2 leaders and more than 0 campers - send warnings to relevant parties.
client.on('voiceStateUpdate', function(oldState, newState) {
    if (oldState.channel === null) return;
    const leadersInOldChannel = leadersInChannel(oldState.channel);
    const nonleadersInOldChannel = oldState.channel.members.size - leadersInOldChannel.length;
    if (nonleadersInOldChannel > 0 && leadersInOldChannel.length < 2) {
        const channelName = oldState.channel.name;
        const message = `[WARNING] The channel ${channelName} has ${nonleadersInOldChannel} campers, but less than 2 leaders to supervise.`;
        newState.member.send(message);
        leadersInOldChannel.forEach(leader => leader.send(message));
    }
});

// Helper
const isLeader = (member) => member.roles.cache.some(role => role.name === 'Leader');
const leadersInChannel = (channel) => Array.from(channel.members.values()).filter((member) => isLeader(member));

// Start
client.login(TOKEN);

