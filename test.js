var Discordie;
try { Discordie = require('discordie'); } catch(e) {}


const client = new Discordie({autoReconnect: true});
const Events = Discordie.Events;


client.connect({
	token: 'Mjc0NTU4NjY1NjQwNjQwNTEy.C2z27A.JUGs7m0PgMSYTFZgaO-02ZGIpFc'
});

var fuckyou = ". \n" +
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

var commands = "!fu\n!stupid bot\n!shit\n!poop\n";


client.Dispatcher.on(Events.GATEWAY_READY, e => {
	client.User.username = "ShitBot";
	console.log('Connected as: ' + client.User.username);
});

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
	console.log(e);
	var content = e.message.content;
	var message;
	if(content == '.fu') {
		message = fuckyou;
	}
	if(content == ".stupid bot") {
		message = "No u!";
	}
	if(content == ".shit" || content == "!poop") {
		message = ":poop:";
	}
	if(content == ".help") {
		message = "GTFO"
	}
	if(content == ".commands") {
		message = commands;
	}
	
	e.message.channel.sendMessage(message);
});

client.Dispatcher.on(Events.PRESENCE_UPDATE, e => {

	var status = e.user.status;
	var prevStatus = e.user.previousStatus;
	var channel;

	if (status != prevStatus) {
		channel = getChannel("bottesting");
		if(e.user.username == "Coffeefox") {
			if(status == "online" && prevStatus == "offline") {
				channel.sendMessage("Hej Mikael!");
			} 
			else if(status == "offline" && prevStatus == "online") {
				channel.sendMessage("Hejdå Mikael!");
			}
		}
	}

	console.log(status);
	console.log(prevStatus);

	var game = e.user.gameName;
	var prevGame = e.user.previousGameName;
	
	channel = getChannel("bottesting");
	
	if (game != prevGame) {
		var message;
		if(game != null) {
			message = e.user.username + " started playing " + game;
		} else if(prevGame != null) {
			message = e.user.username + " stopped playing " + prevGame;
		}
		channel.sendMessage(message);
	}

	console.log(game);
	console.log(prevGame);
});

function getChannel(cname) {
	return client.Channels.filter(c => (c.name == cname))[0];
}

function getUser(uname) {
	return client.Users.filter(u => (u.username == uname))[0];
}
