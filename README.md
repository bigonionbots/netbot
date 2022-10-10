# netbot
by Big Onion

Feel free to contact me on [The Onion Patch](https://discord.gg/SgGDVVHwUj) Discord server for any questions.

## Requirements
- Discord.js
- node-fetch

## Setting up the bot
Modify the `config.json.example` file to include bot tokens and a webhook address where error messages can be posted and rename the file to `config.json`.

In the config.json, each network bot will need the following:
- *coin*: name of the coin
- *token*: bot token from Discord, can be obtianed from discord.com/developers page
- *hashval*: single letter to designate the term used by the algo (S for Sols, H for Hashes)

## Data source
This pulls data from Minerstats API. I would recommend testing to make sure the coin you intend to use is supported. Documentation for Minestat API can be found here: https://api.minerstat.com/docs-coins/documentation
