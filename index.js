const {
  Client,
  GatewayIntentBits,
  ChannelType
} = require("discord.js");

const {
  joinVoiceChannel,
  VoiceConnectionStatus
} = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

let connection;

function joinRoom() {
  const guild = client.guilds.cache.get(GUILD_ID);

  if (!guild) {
    console.log("السيرفر غير موجود");
    return;
  }

  const channel = guild.channels.cache.get(CHANNEL_ID);

  if (!channel || channel.type !== ChannelType.GuildVoice) {
    console.log("الروم الصوتي غير موجود");
    return;
  }

  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: true
  });

  console.log("دخل الروم الصوتي");

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    console.log("انقطع الاتصال، محاولة إعادة الاتصال...");

    setTimeout(() => {
      try {
        connection.rejoin();
      } catch {
        joinRoom();
      }
    }, 5000);
  });

  connection.on(VoiceConnectionStatus.Destroyed, () => {
    setTimeout(joinRoom, 5000);
  });
}

client.once("ready", () => {
  console.log(`تم تسجيل الدخول باسم ${client.user.tag}`);
  joinRoom();
});

client.login(TOKEN);
