var Discordie;
try { Discordie = require('discordie'); } catch (e) { }


const client = new Discordie({ autoReconnect: true });
const Events = Discordie.Events;

var colors = require('colors/safe');

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

	TimeLog.debug("User " + e.message.author.username + " sent message '" + content + "' in channel " + e.message.channel.name);

	setDeleteMessage(e.message);

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
		case ".uptime": {
			var startTimeBot = ServerUsers.timeCreated;
			var uptimeBot = Time.calculateTotalTime(new Date(), startTimeBot);
			respondToUserCommand(e, "Bot uptime: " + uptimeBot + "\nSince " + Time.getDateString(startTimeBot));
		} break;
		case ".cc": {
			var msg_ch = e.message.channel;
			var msgs = msg_ch.messages;
			
			// TimeLog.debug(msg_ch + " messages: " + msgs.length);
			// msgs.forEach(function (Imsg) {
			// 	TimeLog.debug("msg: " + Imsg); 
			// });

			respondToUserCommand(e, "Channel created: " + msg_ch.createdAt);
			
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
				respondToUserCommand(e, "Username '" + usrname + "' does not exist, you shitter");
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
		case ".annoy": {
			var subCmd = getRestStr(content, ' ');
			if (subCmd == "toggle") {
				toggleAnnoyance = toggleAnnoyance ? false : true;
				TimeLog.log("Typing-annoyance toggled to: " + toggleAnnoyance);
				respondToUserCommand(e, "Toggled to: " + toggleAnnoyance);
			}
			else {
				try {
					userAnnoy = ServerUsers.get(subCmd).name;
					TimeLog.log("Typing-annoyance listening for: " + userAnnoy + ".");		
					respondToUserCommand(e, "Annoy is set to: " +  userAnnoy);								
				} catch (err) {
					respondToUserCommand(e, "Username '" + usrname + "' does not exist, you shitter");
				}
			}
		} break;
		case ".addignore": {
			var gamename = getRestStr(content, ' ');
			try {
				if(checkGame(gamename)) {
					ignoredGames.push(gamename);
					var msg = "Added " + gamename + " to ignoredGames: " + ignoredGames;
					TimeLog.log(msg);
					respondToUserCommand(e, msg);
				} 
				else {
					throw "Game is already ignored";
				}
			} catch(err) {
				err_msg = "Unable to add " + gamename + " to ignore: ";
				TimeLog.error(err_msg + err)
				respondToUserCommand(e, err_msg + err);
			}
		} break;
		case ".msgdeltimer": {
			var desiredtimer = getRestStr(content, ' ');
			try {
				var isnum = /^\d+$/.test(desiredtimer);
				if(isnum) {
					bot_msg_timer = usr_msg_timer = desiredtimer;
					TimeLog.log("bot_msg_timer & usr_msg_timer is now set to " + bot_msg_timer);
					respondToUserCommand(e, "MessageDeleteTimer is now " + bot_msg_timer);					
				}
			}
			catch (err) {
				err_msg = "Unable to set timer";
				TimeLog.error(err_msg + err)
				respondToUserCommand(e, err_msg + err);
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

	try {

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
	}
	catch (err) {
		TimeLog.debug("New user detected: " + e.user.username + ". Adding to serverUsers\n");
		ServerUsers.add(e.user.username, e.user.status, e.user.registeredAt);
	}

	var game = e.user.gameName;
	var prevGame = e.user.previousGameName;

	var channel = getChannel("bottesting");

	if (game != prevGame) {
		var message;
		TimeLog.debug(user.name + " game: " + game + " | prevgame: " + prevGame)	

		if (checkUserRole(e.member.roles, "Master")) {
			if (checkGame(game)) {
				message = user.startGame(game);
			} 
			else if (checkGame(prevGame)) {
				message = user.endGame(prevGame);
			}
			channel.sendMessage(message)												
			// TimeLog.debug(message)
			
		};
	}
});

client.Dispatcher.on(Events.GUILD_MEMBER_ADD, e => {
	ServerUsers.add(
		e.member.username,
		new UserClass(
			e.member.username,
			e.member.username.status,
			e.member.registeredAt
		)
	);
	TimeLog.log("Added new user to server: " + e.member.username);
});

client.Dispatcher.on(Events.GUILD_MEMBER_REMOVE, e => {
	ServerUsers.remove(e.member.username);
	TimeLog.log("Removed user from server: " + e.member.username);
});

var toggleAnnoyance = false;
var userAnnoy = "Coffeefox";
client.Dispatcher.on(Events.TYPING_START, e => {
	if ((e.user.username == userAnnoy) && toggleAnnoyance) {
		var msg = e.user.username + " is typing something very important right now...";
		e.channel.sendMessage(msg);
	}
});

// ---------------- FUNCTIONS ---------------------
{
	ignoredGames = ["", "Unity"]	
	
	// Returns true if game is not in ignore and is not null, else returns false
	function checkGame(gameName) {
		var inIgnored = ignoredGames.indexOf(gameName) > -1;
		if(gameName != null) {
			if(inIgnored) {
				TimeLog.debug(gameName + " is ignored. Not sending out message about it");					
				return false;
			}
			return true;
		}
		return false;
	}
	
	function respondToUserCommand(event, msg) {
		TimeLog.log("Sent message: " + msg + " to: " + event.message.channel.name);
		event.message.channel.sendMessage(msg);
	}


	var bot_msg_timer = 40000000;
	var usr_msg_timer = 40000000;
	// deletes a specific message after some time
	// may be implemeted directly into the userclass with an array of messages
	// TODO: Implement so that the bot removes messages only after a limit of messages
	function setDeleteMessage(emsg) {

		try {
			if(emsg.channel.name == "bottesting") {
				if(emsg.author.username == client.User.username) {
					setTimeout(() => { emsg.delete() }, bot_msg_timer);
				}
				else {
					setTimeout(() => { emsg.delete().catch((onRejected) => {
						TimeLog.error("Promise-rejection: Message could not be deleted");
					}) }, usr_msg_timer);
				}
			}
		} 
		catch(err) {
			TimeLog.error("Error when deleting message" + err);
		}
	}

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
		this.timeCreated = new Date();
	}

	static add(username, user) {
		this.dict[username] = user;
	}

	static remove(username) {
		delete this.dict[username];
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
		return this.name + " initialized " + game;
	}

	endGame(game) {
		this.gameTime.endTimer();
		var dur = Time.calculateTotalTime(this.gameTime.end, this.gameTime.start);
		var msg = this.name + " quit " + game;		
		if(this.gameTime.start > 0) {
			msg += " (" + dur + ")";
		}
		return msg;
	}

	setOnline() {
		this.status = "online";
		this.loggedOnTime = new Date();
		// TimeLog.debug("User " + this.name + " loggedOnTime set to - " + this.loggedOnTime);
	}

	setOffline() {
		this.status = "offline"
		this.loggedOffTime = new Date();
		// TimeLog.debug("User " + this.name + " loggedOffTime set to - " + this.loggedOffTime);
	}

	getStatus() {
		var ret = "\nStatus " + this.name + ": " + this.status + "\n";
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
		var mm = ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1); // January is 0
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
		var time = Math.floor((end - start) / 1000);

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
		console.log(colors.yellow("[DBG] (" + Time.getTimeString(new Date()) + ") " + text));
	}

	static log(text) {
		console.log(colors.green("[LOG] (" + Time.getTimeString(new Date()) + ") " + text));
	}

	static error(text) {
		console.log(colors.red("[ERR] (" + Time.getTimeString(new Date()) + ") " + text));		
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

const commands = ".\n.fu\n.stupid bot\n.shit\n.rust <item>\n.coffee\n.status <username>\n.reg <username>\n.uptime";

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