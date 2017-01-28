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
	console.log('[LOG] Connected as: ' + client.User.username);

	console.log("[LOG] Adding all users on server");
	client.Users.forEach(function (e) {
		serverUsers[e.username] = new UserClass(e.username);
		
	});
	console.log("[LOG] Users added: " + Object.keys(serverUsers).length);
});

// ---------------- MESSAGE-UPDATES ---------------------

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
	var content = e.message.content;
	var message;
	if (content == '.fu') {
		respondToUserCommand(e, fuckyou);
	}
	if (content == ".stupid bot") {
		respondToUserCommand(e, "No. I'm a shitty bot. Get it right, you little bitch.");
	}
	if (content == ".shit") {
		respondToUserCommand(e, ":poop:");
	}
	if (content == ".help") {
		respondToUserCommand(e, "Computer says no.");
	}
	if (content == ".commands") {
		respondToUserCommand(e, commands);
	}
	if(content.substr(0, content.indexOf(' ')) == ".rust") {
		var link = "http://rust.wikia.com/wiki/";
		var search_item = content.substr(content.indexOf(' ') + 1);
		link += search_item;
		respondToUserCommand(e, link);
	}
	if(content == ".coffee") {
		respondToUserCommand(e, "Grinding coffee-beans...");
		setTimeout(function() { respondToUserCommand(e, "Placing ground coffee in filter...") }, 3000);
		setTimeout(function() { respondToUserCommand(e, "Brewing coffee...") }, 5000);
		setTimeout(function() { respondToUserCommand(e, "Enjoy your shitty coffee. :poop: :coffee:") }, 10000);
	}
	if(content == ".codeblogs") {
		
	}
});

// ---------------- USER-UPDATES  ---------------------

client.Dispatcher.on(Events.PRESENCE_UPDATE, e => {

	var status = e.user.status;
	var prevStatus = e.user.previousStatus;

	if (status != prevStatus) {
		if (status == "online" && prevStatus == "offline") {
			console.log("[LOG] User logged in: " + serverUsers[e.user.username].name);
		}
		else if (status == "offline" && prevStatus == "online") {
			console.log("[LOG] User disconnected: " + serverUsers[e.user.username].name);
		}
	}

	var game = e.user.gameName;
	var prevGame = e.user.previousGameName;

	var channel = getChannel("bottesting");

	if (game != prevGame) {
		var message;
		var user = serverUsers[e.user.username];

		if (checkUserRole(e.member.roles, "Master")) {
			if (game != null) {
				message = user.startGame(game);
				console.log(message);
			} else if (prevGame != null) {
				if (user.gameTime.start != 0) {
					message = user.endGame(prevGame);
				}
				else {
					message = user.name + " stopped playing " + prevGame;
				}
				console.log("[LOG] " + message);
			}
			channel.sendMessage(message)
		};
	}
});


// ---------------- FUNCTIONS ---------------------
function respondToUserCommand(event, msg) {
	console.log("[LOG] Sent message: " + msg + " to: " + event.message.channel.name);
	event.message.channel.sendMessage(msg);
}

function checkUserRole(roles, rname) {
	var role = roles.filter(r => (r.name == rname))[0];
	if(role != undefined) {
		return true;
	}
	return false;

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

	startGame(game) {
		this.gameTime.startTimer();
		return this.name + " started playing " + game;
	}

	endGame(prevGame) {
		return this.name + " stopped playing " + prevGame + ". " + this.gameTime.calculateTotalTime();
	}
}

class Time {
	constructor() {
		this.start = 0;
		this.end = 0;
		this.duration = 0;
	};

	startTimer() {
		this.start = new Date();
	};

	endTimer() {
		this.end = new Date();
	};

	calculateTotalTime() {
		this.endTimer();
		var time = Math.floor((this.end.getTime() - this.start.getTime()) / 1000);

		var hours = Math.floor(time / 3600);
		var minutes = Math.floor((time % 3600) / 60);
		var seconds = time % 60;

		var time_str = "Duration: ";

		if (hours > 0) {
			time_str += hours + "h ";
		}
		if (minutes > 0) {
			time_str += minutes + "m ";
		}
		time_str += seconds + "s";

		// console.log('[DEBUG] ' + time_str);

		return time_str;
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

const commands = ".\n.fu\n.stupid bot\n.shit\n.rust <item>\n.coffee\n";