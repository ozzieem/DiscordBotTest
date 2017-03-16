var Discordie;
try {
  Discordie = require("discordie");
} catch (e) {
}

var colors = require("colors/safe");
var fs = require("fs");


const client = new Discordie({ autoReconnect: true });
const Events = Discordie.Events;

client.connect({
  token: "Mjc0NTU4NjY1NjQwNjQwNTEy.C2z27A.JUGs7m0PgMSYTFZgaO-02ZGIpFc"
});

var TCONNECT_server = ""
var dm_ch = "Should be a DMchannel but is a string -> BAD"  // TODO: remove this shit

// ---------------- BOT-SETUP ---------------------

client.Dispatcher.on(Events.GATEWAY_READY, e => {
  TimeLog.log("Connected as: " + client.User.username);
  TCONNECT_server = getServer("T_CONNECT");
    
  // changes nick at start
  const botuser = getUser("ShitBot")
  botuser.setNickname("Bot")
  
  // create Promise to get DM channel
  const user = getUser("ozz")
  user.openDM().then((result) => {
    dm_ch = result;
    dm_ch.sendMessage(Time.getTimeNowString() + "TCONNECT_Bot Connected");
  });

  ServerUsers.create();
  addUsersOnServer(TCONNECT_server);  
});

// ---------------- MESSAGE-UPDATES ---------------------
// This whole command detection function is retarded, will be fixed at some point.. or not..

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
  var content = e.message.content;

  TimeLog.debug(
    "User " +
      e.message.author.username +
      " sent message '" +
      content +
      "' in channel " +
      e.message.channel.name
  );

  setDeleteMessage(e.message);

  // Standard commands
  switch (content) {
    case ".fu": {
      respondToUserCommand(e, fuckyou);
    }
    break;
    case ".stupid bot": {
      respondToUserCommand(
        e,
        "Of course I'm stupid, you little bitch, if I was written by a stupid person."
      );
    }
    break;
    case ".help": {
      respondToUserCommand(e, "Computer says no.");
    }
    break;
    case ".cmds": {
      respondToUserCommand(e, commands);
    }
    break;
    case ".coffee": {
      respondToUserCommand(e, "Grinding coffee-beans...");
      setTimeout(
        function() {
          respondToUserCommand(e, "Placing ground coffee in filter...");
        },
        3000
      );
      setTimeout(
        function() {
          respondToUserCommand(e, "Brewing coffee...");
        },
        5000
      );
      setTimeout(
        function() {
          respondToUserCommand(e, "Enjoy your shitty coffee. :poop: :coffee:");
        },
        10000
      );
    }
    break;
    case ".uptime": {
      var startTimeBot = ServerUsers.timeCreated;
      var uptimeBot = Time.calculateTotalTime(new Date(), startTimeBot);
      respondToUserCommand(
        e,
        "Bot uptime: " +
          uptimeBot +
          "\nSince " +
          Time.getDateString(startTimeBot)
      );
    }
    break;
    case ".cc": {
      var msg_ch = e.message.channel;
      var msgs = msg_ch.messages;
      respondToUserCommand(e, "Channel created: " + msg_ch.createdAt);
    }
    break;

    default: {
    }
    break;
  }

  // Double word commands
  switch (getFirstWord(content, " ")) {
    case ".rust": {
      var link = "http://rust.wikia.com/wiki/";
      var search_item = getRestStr(content, " ");
      link += search_item;
      respondToUserCommand(e, link);
    }
    break;
    case ".s": {
      var usrname = getRestStr(content, " ");
      try {
        respondToUserCommand(e, ServerUsers.get(usrname).getStatus());
      } catch (err) {
        respondToUserCommand(
          e,
          "Username '" + usrname + "' does not exist"
        );
      }
    }
    break;
    case ".reg": {
      var usrname = getRestStr(content, " ");
      try {
        respondToUserCommand(e, ServerUsers.get(usrname).getRegistered());
      } catch (err) {
        respondToUserCommand(
          e,
          "Username '" + usrname + "' does not exist"
        );
      }
    }
    break;
    case ".annoy": {
      var subCmd = getRestStr(content, " ");
      if (subCmd == "toggle") {
        toggleAnnoyance = toggleAnnoyance ? false : true;
        TimeLog.log("Typing-annoyance toggled to: " + toggleAnnoyance);
        respondToUserCommand(e, "Toggled to: " + toggleAnnoyance);
      } else {
        try {
          userAnnoy = ServerUsers.get(subCmd).name;
          TimeLog.log("Typing-annoyance listening for: " + userAnnoy + ".");
          respondToUserCommand(e, "Annoy is set to: " + userAnnoy);
        } catch (err) {
          respondToUserCommand(
            e,
            "Username '" + usrname + "' does not exist"
          );
        }
      }
    }
    break;
    case ".addignore": {
      var gamename = getRestStr(content, " ");
      try {
        if (checkGame(gamename)) {
          ignoredGames.push(gamename);
          var msg = "Added " + gamename + " to ignoredGames: " + ignoredGames;
          TimeLog.log(msg);
          respondToUserCommand(e, msg);
        } else {
          throw "Game is already ignored";
        }
      } catch (err) {
        err_msg = "Unable to add " + gamename + " to ignore: ";
        TimeLog.error(err_msg + err);
        respondToUserCommand(e, err_msg + err);
      }
    }
    break;
    case ".mdt": {
      var time_str = getRestStr(content, " ");
      try {
        var time = time_str.charAt(0);
        var time_type  = time_str.charAt(1);
        var isnum = /^\d+$/.test(time);
        if (isnum && (time_type == "h" || time_type == "m" || time_type == "s")) {
          msg = setDeleteTimer(time, time_type);
          var msg = "MessageDeleteTimer is now set to " + msg_del_timer + "ms from " + time_str;
          TimeLog.log(msg);
          respondToUserCommand(e, msg);
        }
        else {
          throw "Unspecified time";          
        }
      } catch (err) {
        err_msg = "Unable to set timer - ";
        TimeLog.error(err_msg + err);
        respondToUserCommand(e, err_msg + err);
      }
    }
    break;
    case ".notify": {
      var option = getRestStr(content, " ");
      try {
        if(option == "toggle") {
          notifyUpdates = notifyUpdates ? false : true
          respondToUserCommand(e, "NotifyUpdates set to: " + notifyUpdates);         
        }
        else if(option == "show") {
          respondToUserCommand(e, "NotifyUpdatesChannel: " + notifyUpdateChannel);
        }
        else {
          if(option == "ozz") {
            notifyUpdateChannel == e.message.channel
            TimeLog.log("NotifyUpdateChannel set to: ", notifyUpdateChannel.name)
          } 
          else {
            notifyUpdateChannel = getServerChannel(option)
          }
          respondToUserCommand(e, "NotifyUpdateChannel set to: " + notifyUpdateChannel.name);          
        }
      } catch (err) {
        TimeLog.error(err);
        respondToUserCommand(e, err);
      }
    }
    break;
    case ".botnick": {
      var nickname = getRestStr(content, " ");
      var bot = getUser("ShitBot")
      bot.setNickname(nickname).then(()=> {
        respondToUserCommand(e, "Botnick set to: " + nickname);
        TimeLog.log("Botnick set to: " + nickname)
      }, ()=> {
        err_msg = "Failed to set BotNick"
        respondToUserCommand(e, err_msg);
        TimeLog.error(err_msg)
      })
    }
    break;

    default: {
    }
    break;
  }
});

// ---------------- USER-UPDATES  ---------------------

notifyUpdates = true
notifyUpdateChannel = dm_ch

client.Dispatcher.on(Events.PRESENCE_UPDATE, e => {
  var user = ServerUsers.get(e.user.username);

  var status = e.user.status;
  var prevStatus = e.user.previousStatus;
  notifyUpdateChannel = dm_ch  

  try {
    if (status != prevStatus) {
      var statusMessage = TimeLog.getTimeNowString() + user.name;
      if (status == "online" && prevStatus == "offline") {
        user.setOnline();
        statusMessage += " connected.";
      } else if (status == "offline" && prevStatus == "online") {
        user.setOffline();
        statusMessage += " disconnected.";
      }
      if(notifyUpdates && checkUserRole(e.member.roles, "Master")) {
        notifyUpdateChannel.sendMessage(statusMessage);        
      }
      TimeLog.log(statusMessage)
    }
  } catch (err) {
    TimeLog.debug(
      "New user detected: " + e.user.username + ". Adding to serverUsers\n"
    );
    ServerUsers.add(e.user.username, e.user.status, e.user.registeredAt);
  }

  var game = e.user.gameName;
  var prevGame = e.user.previousGameName;


  if (game != prevGame) {
    var message;
    TimeLog.debug(user.name + " game: " + game + " | prevgame: " + prevGame);

    if (checkUserRole(e.member.roles, "Master") && notifyUpdates) {
      if (checkGame(game)) {
        message = user.startGame(game);
        notifyUpdateChannel.sendMessage(message);
      } else if (checkGame(prevGame)) {
        message = user.endGame(prevGame);
        notifyUpdateChannel.sendMessage(message);
      }
      TimeLog.log(message)
    }
  }
});

// ------------------ GUILD MEMBER ADD/REMOVE ---------------------

client.Dispatcher.on(Events.GUILD_MEMBER_ADD, e => {
  ServerUsers.add(e.member.username, new UserClass(
    e.member.username,
    e.member.username.status,
    e.member.registeredAt
  ));
  TimeLog.log("Added new user to server: " + e.member.username);
});

client.Dispatcher.on(Events.GUILD_MEMBER_REMOVE, e => {
  ServerUsers.remove(e.member.username);
  TimeLog.log("Removed user from server: " + e.member.username);
});


// ------------------ TYPING ---------------------
var toggleAnnoyance = false;
var userAnnoy = "Coffeefox";
client.Dispatcher.on(Events.TYPING_START, e => {
  if (e.user.username == userAnnoy && toggleAnnoyance) {
    var msg = e.user.username +
      " is typing something very important right now...";
    e.channel.sendMessage(msg);
  }
});

// ---------------- FUNCTIONS ---------------------
{
  ignoredGames = ["LyX", "Unity"];

  // Returns true if game is not in ignore and is not null, else returns false
  function checkGame(gameName) {
    var inIgnored = ignoredGames.indexOf(gameName) > -1;
    if (gameName != null) {
      if (inIgnored) {
        TimeLog.debug(
          gameName + " is ignored. Not sending out message about it"
        );
        return false;
      }
      return true;
    }
    return false;
  }

  function respondToUserCommand(event, msg) {
    var channel = event.message.channel;
    TimeLog.log("Sent message: " + msg + " to: " + channel.name);
    channel.sendMessage(msg);
  }
  
  // deletes a specific message after some time
  // may be implemeted directly into the userclass with an array of messages
  // TODO: Implement so that the bot removes messages only after a limit of messages
  var msg_del_timer = 10000000; // initial time - about 3h
  function setDeleteMessage(emsg) {
    try {
      if (emsg.channel.name == "masters" || emsg.channel.name == "ozz") {
          setTimeout(
            () => {
              emsg.delete().then(
                (onFulFilled) => {
                TimeLog.log("Deleted message by " + emsg.author.username + " (" + emsg + ") in channel - " + emsg.channel.name + " - " + onFulFilled);
              }, (onRejected) => {
                TimeLog.error("Message by " + emsg.author.username + + " (" + emsg + ") in channel - " + emsg.channel.name + " could not be deleted - " + onRejected);
              });
            },
            msg_del_timer
          );
      }
    } catch (err) {
      TimeLog.error("Error when deleting message" + err);
    }
  }

  function setDeleteTimer(timer_amount, timer_type) {
    switch(timer_type) {
      case "h": {
        msg_del_timer = timer_amount * 3600 * 1000; // convert hour to milliseconds
      } break;
      case "m": {
        msg_del_timer = timer_amount * 60 * 1000; // convert minutes to milliseconds
      } break;
      case "s": {
        msg_del_timer = timer_amount * 1000; // convert seconds to milliseconds
      } break;
      default: {
      } break;
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
    onlineUsers.forEach(function(onlineUser) {
      ServerUsers.add(onlineUser.username, new UserClass(
        onlineUser.username,
        onlineUser.status,
        onlineUser.registeredAt
      ));
    });
    TimeLog.log("Online users added: " + onlineUsers.length);

    offlineUsers.forEach(function(offlineUser) {
      ServerUsers.add(offlineUser.username, new UserClass(
        offlineUser.username,
        offlineUser.status,
        offlineUser.registeredAt
      ));
    });
    TimeLog.log("Offline users added: " + offlineUsers.length);
    TimeLog.log("Total users added: " + ServerUsers.size());
  }

  function checkUserRole(roles, rname) {
    var role = roles.filter(r => r.name == rname)[0];
    if (role != undefined) {
      return true;
    }
    return false;
  }

  function getServerChannel(cname) {
    return TCONNECT_server.channels.filter(c => c.name == cname)[0];
  }

  function getServer(sname) {
    return client.Guilds.find(s => s.name == sname);
  }

  function getUser(uname) {
    return TCONNECT_server.members.filter(u => u.username == uname)[0];
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
  }

  startGame(game) {
    this.gameTime.startTimer();
    return Time.getTimeNowString() + this.name + " initialized " + game;
  }

  endGame(game) {
    this.gameTime.endTimer();
    var dur = Time.calculateTotalTime(this.gameTime.end, this.gameTime.start);
    var msg = Time.getTimeNowString() + this.name + " quit " + game;
    if (this.gameTime.start > 0) {
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
    this.status = "offline";
    this.loggedOffTime = new Date();
    // TimeLog.debug("User " + this.name + " loggedOffTime set to - " + this.loggedOffTime);
  }

  getStatus() {
    var ret = "\nStatus " + this.name + ": " + this.status + "\n";
    if (this.status == "online") {
      ret += "Logged in at: " + Time.getDateString(this.loggedOnTime) + "\n";
      ret += "Online for: " +
        Time.calculateTotalTime(new Date(), this.loggedOnTime) +
        "\n";
    }
    if (this.status == "offline") {
      ret += "Last seen online: " +
        Time.getDateString(this.loggedOffTime) +
        "\n";
      ret += "Offline for: " +
        Time.calculateTotalTime(new Date(), this.loggedOffTime) +
        "\n";
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
  }

  static getTimeString(d) {
    var h = (d.getHours() < 10 ? "0" : "") + d.getHours();
    var m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
    var s = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();

    return h + ":" + m + ":" + s;
  }

  static getTimeNowString() {
    return "(" + this.getTimeString(new Date()) + ") "
  }

  static getDateString(d) {
    var h = (d.getHours() < 10 ? "0" : "") + d.getHours();
    var m = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
    var s = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();

    var dd = (d.getDate() < 10 ? "0" : "") + d.getDate();
    var mm = (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1); // January is 0
    var yyyy = d.getFullYear();

    var time = h + ":" + m + ":" + s;
    var date = yyyy + "-" + mm + "-" + dd;

    return time + " (" + date + ")";
  }

  startTimer() {
    this.start = new Date();
  }

  endTimer() {
    this.end = new Date();
  }

  static calculateTotalTime(end, start) {
    var time = Math.floor((end - start) / 1000);

    var hours = Math.floor(time / 3600);
    var minutes = Math.floor(time % 3600 / 60);
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
  }
}

/**
 * Class for printing messages to console with time
 */
class TimeLog {
  static debug(text) {
    var msg = "[DBG] " + Time.getTimeNowString() + text;
    console.log(colors.yellow(msg));
    this.log_to_file(msg);
  }

  static log(text) {
    var msg = "[LOG] " + Time.getTimeNowString() + text;
    console.log(colors.green(msg));
    this.log_to_file(msg);
  }

  static error(text) {
    var msg = "[ERR] " + Time.getTimeNowString() + text;
    console.log(colors.red(msg));
    this.log_to_file(msg);
  }

  static log_to_file(str) {
    fs.appendFile("./botlogs.txt", str + "\n", (err) => {
        if(err) {
            return console.log(colors.red(err));
        }
    }); 
  };
}

{
  // command classes
  {
    // Command classes
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
    class Command {}
  }
}
// ------------------------------------------------

const commands = ".\n.fu\n.stupid bot\n.shit\n.rust <item>\n.help\n.coffee\n.cc\n.notify\n.s <username>\n.reg <username>\n.uptime\n.reg <username>\n";

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
