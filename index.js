const Discord = require('discord.js')
const axios = require('axios')

const client = new Discord.Client();

let tokenCode = "NzcxOTkyODAxNjgwNDI0OTgw.X50MUg.vXcyf6kOW7H0ezuOf0UuhU0vTUQ"
client.login(tokenCode);

let genres = null
axios.get("https://api.themoviedb.org/3/genre/movie/list?api_key=40ea41cbc6d20a43cbea8c1891f1df86&language=en-US")
    .then((res) => {
        genres = res.data["genres"]
        for (let i = 0; i < genres.length; ++i)
        {
            console.log(genres[i]["name"])
            console.log(genres[i]["id"])
        }
    })

client.on('ready', () => {
    console.log("The bot is ready");
});

client.on('message', (msg) => {
    if (msg.content.toLowerCase().includes("!mb"))
    {
        msg.channel.send("Hey @" + msg.author.username + " , did you mention me?");
    }
});

