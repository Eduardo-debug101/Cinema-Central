
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const friendId = urlParams.get('id');

    updateFriendProfileUI(friendId);
    loadFriendProfilePicture(friendId);
    loadFriendFavoriteMovies(friendId);
    loadFriendFavoriteGenres(friendId);
    loadFriendWatchlistMovies(friendId);
    loadFriendBookmarkedMovies(friendId);
    loadFriendFavoritePeople(friendId);
});

function updateFriendProfileUI(userID) {

    keyval = new Keyval(KEYVAL_API_KEY);

    if (!userID || userID === 'null') {
        console.log("Invalid user ID");
        return;
    }

    keyval.get("user-" + userID,
        function (results) {
            let jsonResults = JSON.parse(results);
            document.getElementById('friend-username').textContent = jsonResults.user_info[0].username;
            document.getElementById('friend-bio').textContent = jsonResults.user_info[0].bio;
        },
        function (error) {
            console.log("Error occurred when retrieving profile information:", error);
        }
    );
}

function loadFriendProfilePicture(userID) {
    keyval = new Keyval(KEYVAL_API_KEY);

    if (!userID || userID === 'null') {
        console.log("Invalid user ID");
        return;
    }

    keyval.get("user-" + userID,
        function (result) {
            let jsonResults = JSON.parse(result);
            document.getElementById('profile-picture2').src = jsonResults.user_info[0].profile_pic;
        },
        function () {
            console.log("Error when fetching profile pic from keyval.");
        }
    );
}

function showFriendProfile() {
    document.getElementById("profile-only-button").className = "selected-standard-button";
    document.getElementById("favorites-button").className = "standard-button";
    document.getElementById("friends-button").className = "standard-button";
    document.getElementById("watching-button").className = "standard-button";

    //document.getElementById('edit-profile-button').innerText = "Edit Profile";

    document.getElementById("edit-controls").style.display = "none";
    document.getElementById("picture-edit-controls").style.display = "none";

    document.getElementById("all-friend-elements").style.display = "none";
    document.getElementById("favorites-section").style.display = "none";

    document.getElementById("profile-pic-div").style.display = "block";
    document.getElementById("profile-info").style.display = "block";

    document.getElementById("watching-movies").style.display = "none";
    //document.getElementById("edit-profile-button").style.display = "flex";
}

function showFriendFavorites() {
    document.getElementById("profile-only-button").className = "standard-button";
    document.getElementById("favorites-button").className = "selected-standard-button";
    document.getElementById("friends-button").className = "standard-button";
    document.getElementById("watching-button").className = "standard-button";

    // document.getElementById('edit-profile-button').innerText = "Edit Profile";

    document.getElementById("edit-controls").style.display = "none";
    document.getElementById("picture-edit-controls").style.display = "none";

    document.getElementById("all-friend-elements").style.display = "none";
    document.getElementById("favorites-section").style.display = "block";

    document.getElementById("profile-pic-div").style.display = "none";
    document.getElementById("profile-info").style.display = "none";

    document.getElementById("watching-movies").style.display = "none";
    //document.getElementById("edit-profile-button").style.display = "none";
}

function showFriendWatching() {
    document.getElementById("profile-only-button").className = "standard-button";
    document.getElementById("favorites-button").className = "standard-button";
    document.getElementById("friends-button").className = "standard-button";
    document.getElementById("watching-button").className = "selected-standard-button";

    //document.getElementById('edit-profile-button').innerText = "Edit Profile";

    document.getElementById("edit-controls").style.display = "none";
    document.getElementById("picture-edit-controls").style.display = "none";

    document.getElementById("all-friend-elements").style.display = "none";
    document.getElementById("favorites-section").style.display = "none";

    document.getElementById("profile-pic-div").style.display = "none";
    document.getElementById("profile-info").style.display = "none";

    document.getElementById("watching-movies").style.display = "block";
    //document.getElementById("edit-profile-button").style.display = "none";
}

function loadFriendFavoriteMovies(userID) {
    keyval = new Keyval(KEYVAL_API_KEY);


    // get parent for where everything should go
    let parent = document.getElementById("favorite-movies");

    keyval.get("user-" + userID,
        function (results) {
            let jsonResults = JSON.parse(results);
            console.log(jsonResults);
            // create deck
            let movies;

            if (jsonResults.user_info[0].favorite_movies.length != 0) {
                movies = new HorizontalDeck(
                    parent,
                    "default_movie.jpg",
                    undefined,
                    { style: "--card-background-color: #131e34; --card-text-color-hover:  #131e34; --card-background-color-hover: white; --card-text-color: white; --card-title-padding: 0.5rem; --card-title-font-size: 0.9rem;" }
                );
            } 

            for (let i = 0; i < jsonResults.user_info[0].favorite_movies.length; i++) {
                let movieID = jsonResults.user_info[0].favorite_movies[i];
                let movie_url = constructURL("movie/" + movieID, "1", null);

                httpGet(movie_url, 'json',
                    function (data) {
                        let title = data.title;
                        let imageUrl = "https://image.tmdb.org/t/p/w500/" + data.poster_path;
                        let link = "movie_page.html?id=" + data.id;

                        movies.addCard(
                            title,
                            imageUrl,
                            link
                        );

                        // Display the first movie as the favorite movie in the HTML
                        if (i === 0) {
                            document.getElementById("favorite-movie").innerText = title;
                        }
                    }
                );
            }
        },
        function () {
            console.log("An error occurred when retrieving favorite movies from keyval.");
            let no_movies = new TextElement("No favorite movies.", "h3", parent, []);
            return;
        }
    );
}

function loadFriendFavoriteGenres(userID) {
    keyval = new Keyval(KEYVAL_API_KEY);
  
      keyval.get("user-" + userID,
        function (result) {
          try {
            let jsonResults = JSON.parse(result);
            const favoriteGenres = jsonResults.user_info[0].favorite_genres;
  
            // Assuming 'favorite-genres-container' is the ID of the container to display genres
            const genresContainer = document.getElementById('favorite-genres-container');
  
            // Clear existing content in the container
            genresContainer.innerHTML = '';
  
            // Display genres with commas
            const genresText = favoriteGenres.join(', ');
            const genresElement = document.createElement('span');
            genresElement.textContent = genresText;
            genresContainer.appendChild(genresElement);
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        },
        function () {
          console.log("Error when fetching favorite genres from keyval.");
        }
      );

}

function loadFriendWatchlistMovies(userID) {
    keyval = new Keyval(KEYVAL_API_KEY);
  
    // get parent for where everything should go
    let parent = document.getElementById("watched-movies");
  
    keyval.get("user-" + userID,
      function (results) {
        let jsonResults = JSON.parse(results);
        console.log(jsonResults);
        // create deck
        let movies;
  
        if (jsonResults.user_info[0].watchlist.length != 0) {
          movies = new HorizontalDeck(
            parent,
            "default_movie.jpg",
            undefined,
            { style: "--card-background-color: #131e34; --card-text-color-hover:  #131e34; --card-background-color-hover: white; --card-text-color: white; --card-title-padding: 0.5rem; --card-title-font-size: 0.9rem;" }
          );
        }
  
        // loop through movies and load
        for (let i = 0; i < jsonResults.user_info[0].watchlist.length; i++) {
          let movie_url = constructURL("movie/" + jsonResults.user_info[0].watchlist[i], "1", null);
          // console.log(jsonResults.user_info[0].watchlist[i]);
  
          httpGet(movie_url, 'json',
            function (data) {
              let title = data.title;
              let imageUrl = "https://image.tmdb.org/t/p/w500/" + data.poster_path;
              let link = "movie_page.html?id=" + data.id;
  
              movies.addCard(
                title,
                imageUrl,
                link
              )
            }
          );
        }
      },
      function () {
        console.log("An error occurred when retriving watchlist from keyval.");
        let no_movies = new TextElement("No movies on your watched list.", "h3", parent, []);
        return;
      }
    );
}

function loadFriendBookmarkedMovies(userID) {
    keyval = new Keyval(KEYVAL_API_KEY);
  
    // get parent for where everything should go
    let parent = document.getElementById("bookmarked-movies");
  
    keyval.get("user-" + userID,
      function (results) {
        let jsonResults = JSON.parse(results);
        console.log(jsonResults);
        // create deck
        let movies;
  
        if (jsonResults.user_info[0].bookmarked_movies.length != 0) {
          movies = new HorizontalDeck(
            parent,
            "default_movie.jpg",
            undefined,
            { style: "--card-background-color: #131e34; --card-text-color-hover:  #131e34; --card-background-color-hover: white; --card-text-color: white; --card-title-padding: 0.5rem; --card-title-font-size: 0.9rem;" }
          );
        }
  
        // loop through movies and load
        for (let i = 0; i < jsonResults.user_info[0].bookmarked_movies.length; i++) {
          let movie_url = constructURL("movie/" + jsonResults.user_info[0].bookmarked_movies[i], "1", null);
          // console.log(jsonResults.user_info[0].bookmarked_movies[i]);
  
          httpGet(movie_url, 'json',
            function (data) {
              let title = data.title;
              let imageUrl = "https://image.tmdb.org/t/p/w500/" + data.poster_path;
              let link = "movie_page.html?id=" + data.id;
  
              movies.addCard(
                title,
                imageUrl,
                link
              )
            }
          );
        }
      },
      function () {
        console.log("An error occurred when retriving bookmarks from keyval.");
        let no_movies = new TextElement("No movies on your watch later list.", "h3", parent, []);
        return;
      }
    );
}

function loadFriendFavoritePeople(userID) {
    keyval = new Keyval(KEYVAL_API_KEY);
  
    let parent = document.getElementById("favorite-people-container");
  
    keyval.get("user-" + userID,
      function (results) {
        let jsonResults = JSON.parse(results);
        console.log(jsonResults);
  
        let people;
        if (jsonResults.user_info[0].favorite_people.length !== 0) {
          people = new HorizontalDeck(
            document.getElementById("favorite-people-container"),
            "default_person.png",
            undefined,
            { style: "--card-background-color: #131e34; --card-text-color-hover:  #131e34; --card-background-color-hover: white; --card-text-color: white; --card-title-padding: 0.5rem; --card-title-font-size: 0.9rem;" }
          );
  
          jsonResults.user_info[0].favorite_people.forEach(personId => {
            let personDetailsUrl = `https://api.themoviedb.org/3/person/${personId}?api_key=${TMDB_API_KEY}`;
            httpGet(personDetailsUrl, 'json',
              function (peopleDetails) {
                let name = peopleDetails.name;
                let imageUrl = "https://image.tmdb.org/t/p/w500/" + peopleDetails.profile_path;
                let link = "people_page.html?id=" + peopleDetails.id;
                people.addCard(
                  name,
                  imageUrl,
                  link
                );
              }
            );
          });
        } 
      },
      function () {
        console.log("An error occurred when retrieving people from keyval.");
        let no_person = new TextElement("No favorite people.", "h3", parent, []);
      }
    );
}
  