const Discord = require('discord.js')
const axios = require('axios')
const imdbScraper = require('imdb-scrapper');

// general sort utility function to sort array of objects by specified key
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    });
}

class MessageHandler
{
    constructor()
    {
        this.initHandler()
    }
 
   initHandler()
    {
        /*
        INPUT:
            None

        OUTPUT:
            None

        PROCESSING:
            Populates the object's genres array with all possible genres and their corresponding IDs
        */   
        let genres = null
        let url = "https://api.themoviedb.org/3/genre/movie/list?api_key=" + process.env.TMDB_TOKEN + "&language=en-US"
        axios.get(url)
            .then((res) => {
                genres = res.data["genres"]
                this.genres = genres
            })
            .catch((err) => {
                if (err.response)
                {
                    console.log(err.response.data);
                    console.log(err.response.status);
                    console.log(err.response.headers);
                }
            });
    }

    handleGenres(genre, msg)
    {
        /*
        INPUT:
            genre: string - the genre which will be used to filter movies by
            msg: Discord Message Object - The discord message object being responded to 

        OUTPUT:
            void function - does not return anything.

        PROCESSING:
            Obtains movies according to the specified genre and sends list of movies
            to the calling discord text channel
        */
        genre = genre.join(" ").toLowerCase()
        console.log(genre)
        console.log(genre.length)

        //If the user is asking for genres, list all the genres
        if (genre == "genres" || genre == "")
        {
            let genreString = ""
            for (let i = 0; i < this.genres.length; ++i)
            {
                if (i != this.genres.length - 1)
                {
                    genreString += this.genres[i]["name"] + ", "
                }
                else
                {
                    genreString += this.genres[i]["name"]
                }
            }
            msg.channel.send("Here are the genres: ")
            msg.channel.send(genreString)
            return;
        }
        
        // compare the user's genre against the list of genres to obtain the genre id for our api call
        let id = 0;
        for (let i = 0; i < this.genres.length; ++i)
        {
            if (genre == this.genres[i]["name"].toLowerCase())
            {
                id = this.genres[i]["id"]
            }
        }

        // In the case of an invalid genre, warn the user and list the available genres for searching
        if (id == 0 && genre != "genres")
        {
            msg.reply("That's an invalid genre. Please choose a genre from one of the following:")
            let genreString = ""
            for (let i = 0; i < this.genres.length; ++i)
            {
                if (i != this.genres.length - 1)
                {
                    genreString += this.genres[i]["name"] + ", "
                }
                else
                {
                    genreString += this.genres[i]["name"]
                }
            }
            msg.channel.send(genreString)
        }

        // In the case of a valid genre, list movies for the selected genre
        else if (genre != "genres")
        {
            msg.reply("Here are some " + genre + " movies");
            let url = "https://api.themoviedb.org/3/discover/movie?api_key=" + process.env.TMDB_TOKEN + "&with_genres=" + id
            axios.get(url)
            .then((response) => {
                let res = response.data;
                console.log(res)
                res['results'] = sortByKey(res['results'], "vote_average")
                let moviesString = "";
                for (let i = 0; i < res['results'].length; ++i)
                {
                    let title = res['results'][i]['title'];
                    let rank = res['results'][i]['vote_average'];
                    console.log("Title: " + title);
                    console.log("Rating: " + rank + "/10");
                    let movieInfo = "**Title:** " + "*" + title + "*" + ", **Rating:** *" + rank + "/10*" + "\n"
                    moviesString += movieInfo;
                }
                msg.channel.send(moviesString)

                console.log("PRINTING STATUS INFO ...")
                console.log(response.status);
                console.log(response.statusText);
                console.log(response.headers);
                console.log(response.config);
            })
            .catch((err) => {
                if (err.response)
                {
                    console.log(err.response.data);
                    console.log(err.response.status);
                    console.log(err.response.headers);
                }
            });
        }
    }

    handleMovies(title, msg)
    {
        /*
        INPUT:
            title: string - the title of the movie info is being requested for
            msg: Discord Message Object - The discord message object being responded to 

        OUTPUT:
            void function - does not return anything.

        PROCESSING:
            Obtains movie info according to the specified title and sends movie metadata
            to the calling discord text channel
        */
        title = title.join(" ").toLowerCase();
        let url = "http://www.omdbapi.com/?apikey=" + process.env.OMDB_TOKEN + "&t=" + title;
        console.log(title)
        axios.get(url)
            .then((response) => {
                let res = response.data;
                console.log(res)

                // If the movie was not found and no info available, inform the user
                if (res["Response"].toLowerCase() == "false")
                {
                    msg.reply("This movie cannot be found. Perhaps check movie spelling")
                }

                // Collect the movie's info and send to the user's channel
                else
                {
                    let title = res["Title"];
                    let rating = res["imdbRating"];
                    let runtime = res["Runtime"];
                    let plot = res["Plot"];
                    let year = res["Year"];
                    let poster = res["Poster"];

                    msg.reply("Here is some info about " + title)
                    let movieInfo = "   \n" + 
                    "                       **Title:** " + title + "\n" +
                    "   **IMDb Rating:** " + rating + "/10 \n" +
                    "   **Runtime:** " + runtime + "\n" +
                    "   **Year:** " + year + "\n" +
                    "   **Plot:** " + plot + "\n";

                    msg.channel.send(movieInfo, {files: [poster]});
                }

                console.log("PRINTING STATUS INFO ...")
                console.log(response.status);
                console.log(response.statusText);
                console.log(response.headers);
                console.log(response.config);
            })
            .catch((err) => {
                if (err.response)
                {
                    console.log(err.response.data);
                    console.log(err.response.status);
                    console.log(err.response.headers);
                }
            });
        
            
        let query = title + " trailer"
        url = "https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&key=" + process.env.YT_TOKEN + "&q=" + query
        axios.get(url)
        .then((res) => {
            res = res.data
            // console.log(res)

            let videoId = res["items"][0]["id"]["videoId"]
            let trailerLink = "https://www.youtube.com/watch?v=" + videoId;
            msg.channel.send("  **Trailer:** " + trailerLink)
        })
            
    }

    handleActors(actor, msg)
    {
        /*
        INPUT:
            actor: string - The name of the actor who's movies we would like to explore
            msg: Discord Message Object - The discord message object being responded to 

        OUTPUT:
            None.

        PROCESSING:
            Sends movies relevant to the queried ctor to the requesting Discord texr channel
        */
        actor = actor.join(" ").toLowerCase()
        console.log(actor)
        let actorId = null

        imdbScraper.searchActor(actor)
            .then((res) => {

                actorId = res[1]["actorId"]
                console.log(actorId)

                if (actorId == null)
                {
                    msg.reply("Sorry, couldn't find that actor. Maybe there was a typo?")
                }

                else
                {
                    let url = "https://api.themoviedb.org/3/find/" + actorId +  "?api_key=" + process.env.TMDB_TOKEN + "&external_source=imdb_id";
                    axios.get(url)
                        .then((res) => {
                            res = res.data;
                            console.log(res)
                            res = res["person_results"]
                            let id = res[0]["id"];

                            let url = "https://api.themoviedb.org/3/discover/movie?api_key=" + process.env.TMDB_TOKEN + "&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_cast=" + id;
                            axios.get(url)
                                .then((res) => {

                                    res = res.data
                                    console.log(res)
                                    res = res["results"]
                                    let moviesString = "";
                                    for (let i = 0; i < res.length; ++i)
                                    {                                        
                                        let title = res[i]['title'];
                                        let rank = res[i]['vote_average'];
                                        console.log("Title: " + title);
                                        console.log("Rating: " + rank + "/10");
                                        let movieInfo = "**Title:** " + "*" + title + "*" + ", **Rating:** *" + rank + "/10*" + "\n"
                                        moviesString += movieInfo;
                                    }
                                    msg.reply(", Here are some movies casting " + actor)
                                    msg.channel.send(moviesString);
                                })
                        })
                }
            })       
    }

    handleHelp(msg)
    {
        /*
        INPUT:
            msg: Discord Message Object - The discord message object being responded to 

        OUTPUT:
            None.

        PROCESSING:
            Sends instructions on how to use the discord movie bot th the calling discord
            text channel
        */
        let helpString = "```"
        helpString += "How to use the Discord Movie Bot: \n"
        helpString += " Searching Genres:  \n"
        helpString += "     !mb genres <your genre> \n"
        helpString += "     eg. !mb genres action \n"
        helpString += "     To view all possible genres use !mb genres genres \n"
        helpString += " Searching Movies  \n"
        helpString += "     !mb movies <movie title> \n"
        helpString += "     eg. !mb movies  action \n"
        helpString += " Searching Actors  \n"
        helpString += "     !mb actors <actor full name> \n"
        helpString += "     eg. !mb actors matthew mcconaughey \n ```"

        msg.reply(helpString)
    }

};

module.exports.MessageHandler = MessageHandler;
