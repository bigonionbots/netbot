/*

NetBot - Provides network hashrate and difficulty using Minerstat API
by Big Onion

https://github.com/bigonionbots/netbot

*/

const { Client, Intents } = require('discord.js');
const fetch = require('node-fetch');
var config = require('./config.json');

sendWebhook("NetBot - getting started");
console.log("NetBot - getting started");

var z = 0;
var botCache = [];
var globalCoinList = [];
for (const Bots of config.bots) {
	if (Bots.token != "") {
	        runBot(Bots,z);
		globalCoinList[z] = Bots.coin;
		z = z + 1;
	}
}

var globalNetworkData = {};

updateNetData();

setInterval(function() {
	updateNetData();
}, 1000*30);

function updateNetData() {
	console.log("Updating globalNetworkData for " + globalCoinList.join(','));
	var netData = fetchNetworkData(globalCoinList.join(',')).catch(error=> {
		console.error("Error fetching netdata: "+ error);
		sendWebhook("NetBot: Error fetching netdata: " + error);
	});
	netData.then(function(res) {
		globalNetworkData = res;
		console.log("Successfully updated globalNetworkData for " + globalCoinList.join(','));
	}).catch(error => {
		console.error("Error with netdata: " + error);
		sendWebhook("NetBot: Error with netdata: " + error);
	});
}

function runBot(Bots,z) {

   const bot = new Client({ intents: [Intents.FLAGS.GUILDS] });

   bot.login(Bots.token).catch(error=>console.error("Error logging in: " + error));

   bot.on('rateLimit', (data) => {
	console.error("Ratelimit Error (" + bot.user.tag +"): " + JSON.stringify(data));
	senWebhook("Ratelimit Error (" + bot.user.tag + "): " + JSON.stringify(data));
   });

   bot.on('ready', () => {

	// update every 30 seconds
	var updateInterval = 1000 * 30;

	var botCache = [];
	botCache[z] = [];
	botCache[z][0] = bot.user.tag;
	botCache[z][1] = bot.user.id;
	botCache[z][2] = 0;

	console.log('Connected, logged in as: ' + botCache[z][0] + ' (' + botCache[z][1] + ')');

	setInterval(function() {
		if (botCache[z][2] == 1) {
			botCache[z][2] = 0;
		} else {
			botCache[z][2] = 1;
		}

		// find index in the array of objects matching Bots.coin and 
		let idx = globalNetworkData.findIndex(n => {
			return n.coin === Bots.coin.toUpperCase();
		});

		if (idx == -1) {
			var networkData = [ "0", "0" ];
		} else {
			var networkData = new Array(hash(globalNetworkData[idx].difficulty),hash(globalNetworkData[idx].network_hashrate)+Bots.hashval+"/s");
		}

		var statusType = new Array("Difficulty","Hashrate");

		// generate nickname of capitalized symbol and price
		var username = networkData[botCache[z][2]];
		var botcount = 0;
		var botstring = "";

		if (idx == -1) {
			var status = "no data";
		} else {
			var status = globalNetworkData[idx].name + " " + statusType[botCache[z][2]];
		}

		botstring = botCache[z][0] + " (" + botCache[z][1] + ") update: " + username + " (status: " + status + ")";
		bot.user.setActivity(status, { type: "WATCHING" });

		bot.guilds.cache.map((guild) => {
			guild.members.cache.get(botCache[z][1]).setNickname(username);
			botcount = botcount + 1;
		});

	        console.log(botstring + " | Completed updates on a total of " + botcount + " servers");
	}, updateInterval);
   });
}

// async function to get price data from coingecko API for coin,read from config
async function fetchPriceData(coin) {
	console.log("Fetching coingecko data: " + coin);
	var response = await fetch("https://api.coingecko.com/api/v3/coins/"+coin+"?localization=false&community_data=false&developer_data=false&sparkline=false")
		.catch(error => console.error("Error: "+ error));
	var data = await response.json();

	return await data;
}

async function fetchNetworkData(coins) {
	console.log("Updating global network data for: " + coins);
	var response = await fetch("https://api.minerstat.com/v2/coins?list="+coins)
		.catch(error => {
			console.error("Error, fetching " + coin + ": " + error);
			sendWebhook("Netbot Error, fetching" + coin + ": " + error);
		});
	var data = await response.json();
	return await data;
}


function sendWebhook(webhookMsg) {
	var params = { content: webhookMsg }
	fetch(config.webhookURL, {
		method: "POST",
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({ content: webhookMsg })
	}).then(res => {
		console.log(res);
	});
}

function hash(value) {
// Thank you ThreePhase for getting rid of the fucking zeros.

   let prefixArray=["","K","M","G","T","P"];
   let prefixCounter = 0;
   while (value>1000) {
        prefixCounter++;
        value = value/1000;
        if (prefixCounter===prefixArray.length-1) {
                break;
        }
   }
   if (value == -1) { return "0 " } else {
   return (Math.round(value*100+Number.EPSILON)/100)+" "+prefixArray[prefixCounter]; }
}
