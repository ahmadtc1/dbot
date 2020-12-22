const Discord = require('discord.js')
const http = require('http');
require('dotenv').config()

// Initialize and login to discord client using token code
const client = new Discord.Client();
client.login(process.env.DISCORD_TOKEN);

// Import and initialize message handler
const handler = require("./handlers/messageHandler");
msgHandler = new handler.MessageHandler();


http.createServer((req, res) => {
res.writeHead(200, {
    'Content-type': 'text/plain'
});
    res.write('Hey');
    res.end();
}).listen(4000);

client.on('ready', () => {
    console.log("Discord Movie Bot ready");
});

client.on('message', (msg) => {
    if (msg.content.toLowerCase().includes("!mb"))
    {
        if (msg.content.toLowerCase().split(" ")[1] == "help" || msg.content.split(" ").length == 1)
        {
            msgHandler.handleHelp(msg);
        }

        else if (msg.content.toLowerCase().split(" ")[1] == "genres" || msg.content.toLowerCase().split(" ")[1] == "genre")
        {
            msgHandler.handleGenres(msg.content.toLowerCase().split(" ").slice(2), msg);
        }

        else if (msg.content.toLowerCase().split(" ")[1] == "movies" || msg.content.toLowerCase().split(" ")[1] == "movie")
        {
            msgHandler.handleMovies(msg.content.toLowerCase().split(" ").slice(2), msg);
        }

        else if (msg.content.toLowerCase().split(" ")[1] == "actors" || msg.content.toLowerCase().split(" ")[1] == "actor")
        {
            console.log("Actor Handler")
            msgHandler.handleActors(msg.content.toLowerCase().split(" ").slice(2), msg)
        }
    }
});
