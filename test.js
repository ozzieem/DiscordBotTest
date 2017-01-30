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

	// Receiveing online/offline users on server
	const guild = client.Guilds.find(g => g.name == "T_CONNECT");

	addUsersOnServer(guild);

	ServerUsers.ToString();
});

// ---------------- MESSAGE-UPDATES ---------------------

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
	var content = e.message.content;

	TimeLog.debug("User " + e.username + " sent message " + content);

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
	// TODO: Abstract this substr-shit into something else
	if (content.substr(0, content.indexOf(' ')) == ".rust") {
		var link = "http://rust.wikia.com/wiki/";
		var search_item = content.substr(content.indexOf(' ') + 1);
		link += search_item;
		respondToUserCommand(e, link);
	}
	// TODO: Same shit here with substr
	if (content.substr(0, content.indexOf(' ')) == ".status") {
		var usrname = content.substr(content.indexOf(' ') + 1);
		try {
			respondToUserCommand(e, ServerUsers.get(usrname).getStatus());
		} catch (err) {
			respondToUserCommand(e, "Username " + usrname + " does not exist, you shitter");
		}
	}
	if (content.substr(0, content.indexOf(' ')) == ".registered") {
		var usrname = content.substr(content.indexOf(' ') + 1);
		try {
			respondToUserCommand(e, ServerUsers.get(usrname).getRegistered());
		} catch (err) {
			respondToUserCommand(e, "Username " + usrname + " does not exist, you shitter");
		}

	}
	if (content == ".coffee") {
		respondToUserCommand(e, "Grinding coffee-beans...");
		setTimeout(function () { respondToUserCommand(e, "Placing ground coffee in filter...") }, 3000);
		setTimeout(function () { respondToUserCommand(e, "Brewing coffee...") }, 5000);
		setTimeout(function () { respondToUserCommand(e, "Enjoy your shitty coffee. :poop: :coffee:") }, 10000);
	}
	if (content == ".codeblogs") {

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
{ // command classes
	const commands = ".\n.fu\n.stupid bot\n.shit\n.rust <item>\n.coffee\n.status <username>\n.registered <username>";	
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
			// static fu_cmd = '.fu';
			// static stupidbot_cmd = '.stupid bot';
			// static shit_cmd = '.shit';
			// static rust_cmd = '.rust';
			// static coffee_cmd = '.coffee';

			fu() {
				return fuckyou;
			}

			stupidbot() {
				return "No. I'm a shitty bot. Get it right, you little bitch.";
			}

			shit() {
				return ":poop:";
			}

			rust(search_word) {
				var link = "http://rust.wikia.com/wiki/";
				var search_item = search_word.substr(search_word.indexOf(' ') + 1);
				link += search_item;
				return link;
			}

			help() {
				return "Computer says No.";
			}

			commands() {
				// TODO: simple way of listing commands
				// return commands;
			}
		}
	}
}

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
		this.loggedOnTime = Time.now();
		this.loggedOffTime = "Undetected";
		this.status = status;
		this.registered = registered;
	};

	startGame(game) {
		this.gameTime.startTimer();
		return this.name + " started playing " + game;
	}

	endGame(prevGame) {
		return this.name + " stopped playing " + prevGame + ". " + this.gameTime.calculateTotalTime();
	}

	setOnline() {
		this.loggedOnTime = Time.now();
		TimeLog.debug("User " + this.name + " loggedOnTime set to - " + this.loggedOnTime);
	}

	setOffline() {
		this.loggedOffTime = Time.now();
		TimeLog.debug("User " + this.name + " loggedOffTime set to - " + this.loggedOffTime);
	}

	getStatus() {
		return (
			"Status for " + this.name + "\n" +
			"Online: " + this.loggedOnTime + "\n" +
			"Offline: " + this.loggedOffTime
		);
	}

	getRegistered() {
		return this.name + " registered at " + this.registered;
	}

	ToString() {
		return this.name + " : " + this.status + " : " + this.registered + "\n";
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

	static now() {
		var d = new Date();
		var h = (d.getHours() < 10 ? '0' : '') + d.getHours();
		var m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
		var s = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();

		return h + ':' + m + ':' + s;
	}

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

/**
 * Class for printing messages to console with time
 */
class TimeLog {
	static debug(text) {
		console.log("[DEBUG] (" + Time.now() + ") " + text);
	}

	static log(text) {
		console.log("[LOG] (" + Time.now() + ") " + text);
	}
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