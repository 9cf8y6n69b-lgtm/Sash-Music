const { ActivityType } = require("discord.js");

module.exports = {
	// ─── General ──────────────────────────────────────────────────────────────
	adminId: "",           // Discord ID of the bot admin
	token: process.env.TOKEN || "",
	clientId: process.env.CLIENT_ID || "",
	clientSecret: process.env.CLIENT_SECRET || "",

	// ─── Music ────────────────────────────────────────────────────────────────
	defaultVolume: 100,    // 1–100
	disconnectTime: 30000, // ms before leaving empty voice channel
	twentyFourSeven: false,
	autoQueue: false,      // auto-add related songs to queue
	autoPause: true,       // pause when everyone leaves
	autoLeave: false,      // leave when everyone leaves
	serverDeafen: true,

	// ─── Lavalink ───────────────────────────────────────────────────────────── لا تغير اي شي هنا ياغالي
	nodes: [
		{
			identifier: "Jirayu-1",
			host: "lavalink.jirayu.net",
			port: 13592,
			password: "youshallnotpass",
			retryAmount: 10,
			retryDelay: 5000,
			secure: false,
		},
		{
			identifier: "Millohost-SSL",
			host: "lava-v4.millohost.my.id",
			port: 443,
			password: "https://discord.gg/mjS5J2K3ep",
			retryAmount: 10,
			retryDelay: 5000,
			secure: true,
		},
	],

	// ─── Emojis ─────────────────────────────────────────────────────────────── ايموجيز اذا تبي تستبدلهم
	emojis: {
		replay: "<:replay:1497196842814017627>",
		play: "<:play:1497196841283092530>",
		pause: "<:pause:1497196839944978523>",
		next: "<:next:1497196837755686984>",
		stop: "<:stop:1497196836283224164>",
		loop1: "<:loop1:1497196832059559998>",
		loop: "<:loop:1497196830457593876>",
		user: "<:user:1497196829060632646>",
		duration: "<:duration:1497196827265601657>",
		live: "<:live:1497196825717903402>",
		yes: "<:yes:1497196823729934396>",
		no: "<:no:1497196821762805861>",
		stats: "<:stats:1497196820038811749>",
		music: "<:music:1497196817933406291>",
	},

	// ─── Appearance ─────────────────────────────────────────────────────────── حالة البوت ولون الايمبدات
	embedColor: "#2f3136",
	iconURL: "https://cdn.darrennathanael.com/icons/spinning_disk.gif",
	presence: {
		status: "online", // online | idle | dnd | invisible
		activities: [
			{
				name: "Music",
				type: ActivityType.Listening,
			},
		],
	},

	// ─── Misc ─────────────────────────────────────────────────────────────────
	helpCmdPerPage: 10,
	lyricsMaxResults: 5,
	debug: true,
};
