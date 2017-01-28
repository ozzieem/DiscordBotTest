var Discordie;
try { Discordie = require('discordie'); } catch (e) { }


const client = new Discordie({ autoReconnect: true });
const Events = Discordie.Events;

client.connect({
	token: 'Mjc0NTU4NjY1NjQwNjQwNTEy.C2z27A.JUGs7m0PgMSYTFZgaO-02ZGIpFc'
});


var serverUsers = {};

// ---------------- BOT-SETUP ---------------------

client.Dispatcher.on(Events.GATEWAY_READY, e => {
	console.log('Connected as: ' + client.User.username);

	console.log("Adding all users on server");
	client.Users.forEach(function (e) {
		serverUsers[e.username] = new UserClass(e.username);
	});
	console.log("Users added: " + Object.keys(serverUsers).length);
});

// ---------------- MESSAGE-UPDATES  ---------------------

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
	var content = e.message.content;
	var message;
	if (content == '.fu') {
		respondToUserCommand(e, fuckyou);
	}
	if (content == ".stupid bot") {
		respondToUserCommand(e, "No u!");
	}
	if (content == ".shit") {
		respondToUserCommand(e, ":poop:");
	}
	if (content == ".help") {
		respondToUserCommand(e, "GTFO");
	}
	if (content == ".commands") {
		respondToUserCommand(e, commands);
	}
});

// ---------------- USER-UPDATES  ---------------------

client.Dispatcher.on(Events.PRESENCE_UPDATE, e => {

	var status = e.user.status;
	var prevStatus = e.user.previousStatus;

	if (status != prevStatus) {
		if (status == "online" && prevStatus == "offline") {
			console.log("[DEBUG] User logged in: " + serverUsers[e.user.username].name);
		}
		else if (status == "offline" && prevStatus == "online") {
			console.log("[DEBUG] User disconnected: " + serverUsers[e.user.username].name);
		}
	}

	var game = e.user.gameName;
	var prevGame = e.user.previousGameName;

	var channel = getChannel("bottesting");

	if (game != prevGame) {
		var message;
		var user = serverUsers[e.user.username];
		if (game != null) {
			user.startGame();
			message = user.name + " started playing " + game;
			console.log(message);
		} else if (prevGame != null) {
			if (user.gameTime.start != 0) {
				user.endGame();
				message = user.name + " stopped playing " + prevGame + ". Duration: " + user.gameTime.total + " s";
			}
			else {
				message = user.name + " stopped playing " + prevGame;
			}
			console.log(message);
		}
		channel.sendMessage(message);
	}
});

// ---------------- FUNCTIONS ---------------------
function respondToUserCommand(event, msg) {
	console.log("Sent message: " + msg + " to channel: " + event.message.channel.name)
	event.message.channel.sendMessage(msg);
}

function getChannel(cname) {
	return client.Channels.filter(c => (c.name == cname))[0];
}

function getUser(uname) {
	return client.Users.filter(u => (u.username == uname))[0];
}
// ------------------------------------------------

// ---------------- CLASSES -----------------------
class UserClass {
	constructor(name) {
		this.name = name;
		this.gameTime = new Time();
	};

	startGame() {
		this.gameTime.startTimer();
	}

	endGame() {
		this.gameTime.calculateTotalTime();
	}
}

class Time {
	constructor() {
		this.start = 0;
		this.end = 0;
		this.total = 0;
	};

	startTimer() {
		this.start = new Date();
	};

	endTimer() {
		this.end = new Date();
	};

	calculateTotalTime() {
		this.endTimer();
		this.total = (this.end.getTime() - this.start.getTime()) / 1000;
		console.log('[DEBUG] Duration: ' + this.total + ' sec');
	};
}
// ------------------------------------------------


const fuckyou = ". \n" +
	"........................./´¯/) \n" +
	"......................,/¯..// \n" +
	"...................../..../ / \n" +
	"............./´¯/'...'/´¯¯`·¸ \n" +
	"........../'/.../..../......./¨¯\ \n" +
	"........('(...´(..´......,~/'...') \n" +
	"........................../..../ \n" +
	"..........''............. _.·´ \n" +
	"..........................( \n" +
	"...........................\\ \n";

const commands = "\n!fu\n!stupid bot\n!shit\n";