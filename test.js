var Discordie;
try { Discordie = require('discordie'); } catch (e) { }


const client = new Discordie({ autoReconnect: true });
const Events = Discordie.Events;

client.connect({
	token: 'Mjc0NTU4NjY1NjQwNjQwNTEy.C2z27A.JUGs7m0PgMSYTFZgaO-02ZGIpFc'
});


// ---------------- BOT-SETUP ---------------------

client.Dispatcher.on(Events.GATEWAY_READY, e => {
	TimeLog.log("Connected as: " + client.User.username);

	ServerUsers.create();

	// Receiving online/offline users on server
	const guild = client.Guilds.find(g => g.name == "T_CONNECT");

	addUsersOnServer(guild);

	// ServerUsers.ToString();
});

// ---------------- MESSAGE-UPDATES ---------------------

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
	var content = e.message.content;

	TimeLog.debug("User " + e.message.author.username + " sent message " + content + " in channel " + e.message.channel.name);

	// Standard commands
	switch (content) {
		case ".fu": {
			respondToUserCommand(e, fuckyou);
		} break;
		case ".stupid bot": {
			respondToUserCommand(e, "Actually, I'm a shitty bot. Get it right, you little bitch.");
		} break;
		case ".shit": {
			respondToUserCommand(e, ":poop:");
		} break;
		case ".help": {
			respondToUserCommand(e, "Computer says no.");
		} break;
		case ".commands": {
			respondToUserCommand(e, commands);
		} break;
		case ".coffee": {
			respondToUserCommand(e, "Grinding coffee-beans...");
			setTimeout(function () { respondToUserCommand(e, "Placing ground coffee in filter...") }, 3000);
			setTimeout(function () { respondToUserCommand(e, "Brewing coffee...") }, 5000);
			setTimeout(function () { respondToUserCommand(e, "Enjoy your shitty coffee. :poop: :coffee:") }, 10000);
		} break;

		default: {

		} break;
	}

	// Double word commands
	switch (getFirstWord(content, ' ')) {
		case ".rust": {
			var link = "http://rust.wikia.com/wiki/";
			var search_item = getRestStr(content, ' ');
			link += search_item;
			respondToUserCommand(e, link);
		} break;
		case ".status": {
			var usrname = getRestStr(content, ' ');
			try {
				respondToUserCommand(e, ServerUsers.get(usrname).getStatus());
			} catch (err) {
				respondToUserCommand(e, err.message + "Username '" + usrname + "' does not exist, you shitter");
			}
		} break;
		case ".reg": {
			var usrname = getRestStr(content, ' ');
			try {
				respondToUserCommand(e, ServerUsers.get(usrname).getRegistered());
			} catch (err) {
				respondToUserCommand(e, "Username '" + usrname + "' does not exist, you shitter");
			}
		} break;

		default: {

		} break;
	}
});


// ---------------- USER-UPDATES  ---------------------

client.Dispatcher.on(Events.PRESENCE_UPDATE, e => {

	var user = ServerUsers.get(e.user.username);

	var status = e.user.status;
	var prevStatus = e.user.previousStatus;

	if (status != prevStatus) {
		if (status == "online" && prevStatus == "offline") {
			user.setOnline();
			TimeLog.log("User logged in: " + ServerUsers.get(e.user.username).name)
		}
		else if (status == "offline" && prevStatus == "online") {
			user.setOffline();
			TimeLog.log("User disconnected: " + ServerUsers.get(e.user.username).name);
		}
	}

	var game = e.user.gameName;
	var prevGame = e.user.previousGameName;

	var channel = getChannel("bottesting");

	if (game != prevGame) {
		var message;
		if (checkUserRole(e.member.roles, "Master")) {
			if (game != null) {
				message = user.startGame(game);
			} else if (prevGame != null) {
				if (user.gameTime.start != 0) {
					message = user.endGame(prevGame);
				}
				else {
					message = user.name + " stopped playing " + prevGame;
				}
			}
			TimeLog.log(message);
			channel.sendMessage(message)
		};
	}
});


// ---------------- FUNCTIONS ---------------------
{
	function getRestStr(str, sep) {
		var extWord = str.substr(str.indexOf(sep) + 1);
		return extWord;
	}

	function getFirstWord(str, sep) {
		var firstWord = str.substr(0, str.indexOf(sep));
		return firstWord;
	}

	function addUsersOnServer(guild) {
		var onlineUsers = client.Users.onlineMembersForGuild(guild);
		var offlineUsers = client.Users.offlineMembersForGuild(guild);

		TimeLog.log("Adding all users on server");
		onlineUsers.forEach(function (onlineUser) {
			ServerUsers.add(
				onlineUser.username,
				new UserClass(
					onlineUser.username,
					onlineUser.status,
					onlineUser.registeredAt
				)
			);
		});
		TimeLog.log("Online users added: " + onlineUsers.length);

		offlineUsers.forEach(function (offlineUser) {
			ServerUsers.add(
				offlineUser.username,
				new UserClass(
					offlineUser.username,
					offlineUser.status,
					offlineUser.registeredAt
				)
			);
		});
		TimeLog.log("Offline users added: " + offlineUsers.length);
		TimeLog.log("Total users added: " + ServerUsers.size());
	}

	function respondToUserCommand(event, msg) {
		TimeLog.log("Sent message: " + msg + " to: " + event.message.channel.name);
		event.message.channel.sendMessage(msg);
	}

	function checkUserRole(roles, rname) {
		var role = roles.filter(r => (r.name == rname))[0];
		if (role != undefined) {
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
}
// ------------------------------------------------

// ---------------- CLASSES -----------------------

/**
 * Static class-container for users on server
 */
class ServerUsers {
	static create() {
		this.dict = {};
	}

	static add(username, user) {
		this.dict[username] = user;
	}

	static get(username) {
		return this.dict[username];
	}

	static size() {
		return Object.keys(this.dict).length;
	}

	static ToString() {
		console.log("Printing all ServerUsers: \n");
		for (var key in this.dict) {
			if (this.dict.hasOwnProperty(key)) {
				console.log(this.dict[key]);
			}
		}
	}
}


/**
 * Custom class for a user
 */
class UserClass {
	constructor(name, status, registered) {
		this.name = name;
		this.gameTime = new Time();
		this.loggedOnTime = new Date();
		this.loggedOffTime = new Date();
		this.status = status;
		this.registered = registered;
	};

	startGame(game) {
		this.gameTime.startTimer();
		return this.name + " started playing " + game;
	}

	endGame(prevGame) {
		this.gameTime.endTimer();
		return this.name + " stopped playing " + prevGame + ". (Duration: " +
			Time.calculateTotalTime(this.gameTime.end, this.gameTime.start) + ")";
	}

	setOnline() {
		this.status = "online";
		this.loggedOnTime = new Date();
		TimeLog.debug("User " + this.name + " loggedOnTime set to - " + this.loggedOnTime);
	}

	setOffline() {
		this.status = "offline"
		this.loggedOffTime = new Date();
		TimeLog.debug("User " + this.name + " loggedOffTime set to - " + this.loggedOffTime);
	}

	getStatus() {
		var ret = "Status " + this.name + ": " + this.status + "\n";
		if (this.status == "online") {
			ret += "Logged in at: " + Time.getDateString(this.loggedOnTime) + "\n";
			ret += "Online for: " + Time.calculateTotalTime(new Date(), this.loggedOnTime) + "\n";
		}
		if (this.status == "offline") {
			ret += "Last seen online: " + Time.getDateString(this.loggedOffTime) + "\n";
			ret += "Offline for: " + Time.calculateTotalTime(new Date(), this.loggedOffTime) + "\n";
		}
		return ret;
	}

	getRegistered() {
		return this.name + " registered at " + this.registered;
	}

	ToString() {
		return this.name + " : " + this.status + " : " + this.registered + "\n";
	}
}


class UserLog {
	constructor() {
		this.logonTime = new Date();
		this.logoffTime = new Date();
	}
}


/**
 * Custom class for time-managing
 */
class Time {
	constructor() {
		this.start = 0;
		this.end = 0;
		this.duration = 0;
	};

	static getTimeString(d) {
		var h = (d.getHours() < 10 ? '0' : '') + d.getHours();
		var m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
		var s = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();

		return h + ':' + m + ':' + s;
	}

	static getDateString(d) {
		var h = (d.getHours() < 10 ? '0' : '') + d.getHours();
		var m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
		var s = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();

		var dd = (d.getDate() < 10 ? '0' : '') + d.getDate();
		var mm = ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1); //January is 0!
		var yyyy = d.getFullYear();

		var time = h + ':' + m + ':' + s;
		var date = yyyy + '-' + mm + '-' + dd;

		return time + " (" + date + ")";
	}

	startTimer() {
		this.start = new Date();
	};

	endTimer() {
		this.end = new Date();
	};

	static calculateTotalTime(end, start) {
		var time = Math.floor((end.getTime() - start.getTime()) / 1000);

		var hours = Math.floor(time / 3600);
		var minutes = Math.floor((time % 3600) / 60);
		var seconds = time % 60;

		var time_str = "";

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


/**
 * Class for printing messages to console with time
 */
class TimeLog {
	static debug(text) {
		console.log("[DEBUG] (" + Time.getTimeString(new Date()) + ") " + text);
	}

	static log(text) {
		console.log("[LOG] (" + Time.getTimeString(new Date()) + ") " + text);
	}
}

{ // command classes
	{	// Command classes
		/**
		 * Command container
		 */
		class CommandList {
			constructor() {
				this.cmds = {};
			}

			add(cmd_obj) {
				this.cmds[cmd_obj.cmd] = cmd_obj;
			}

			addAll() {
			}
		}

		/**
		 * A command class to store a specific command
		 */
		class Command {

		}
	}
}
// ------------------------------------------------

const commands = ".\n.fu\n.stupid bot\n.shit\n.rust <item>\n.coffee\n.status <username>\n.reg <username>";

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