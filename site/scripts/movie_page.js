// JS for movie_page.html

let currentPage = 1; // Initial page


/**
 * Reset window back to index.html (home page)
 */
function logoClicked() {
  window.location.href = "index.html";
}

/**
 * Set window to movie_page.hmtl and pass id in URL
 */
function movieClicked() {
  currentID = event.target.id;
  console.log(currentID);
  window.location.href = "movie_page.html?id=" + currentID;
}

/**
 * function happens on page load
 */
function loadPage() {
  var urlSearchParameters = new URLSearchParams(window.location.search);
  var id = urlSearchParameters.get('id');

  newPageParams(id);
  loadButtons(id);
}

/**
 * Request movie information from TMDB API based on id in URL
 */
function newPageParams(id) {
  if (id) {
    currentID = id;
    console.log(currentID);
  }

  var movieURL = constructURL("movie/" + id, 1, null);

  httpGet(movieURL, 'json', loadMovie);

  let creditsURL = constructURL("movie/" + id + "/credits", 1, null);

  // use movie credits to load actors and directors
  httpGet(creditsURL, 'json',
    function (data) {
      loadDirectors(data);
      loadActors(data);
    }
  );

  var trailerURL = constructURL("movie/" + id + "/videos", 1, null);
  httpGet(trailerURL, 'json', loadTrailer);


  // Load reviews for the first page
  loadReviewsPage(id, currentPage);

  // Add a button to load more reviews
  const loadMoreButton = document.getElementById("loadMoreButton");
  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", function () {
      currentPage++;
      loadReviewsPage(id, currentPage);
    });
  }
}

/**
 * Set element on page to reflect the selected movie
 * @param {*} res - data from an event
 */
function loadMovie(res) {
  // Movie Title
  var movieTitle = res["title"];
  if (res["release_date"]) {
    movieTitle += " (" + getReleaseYear(res["release_date"]) + ")";
  }
  document.getElementById("Movie Name").innerText = movieTitle;

  // Movie Details
  var movieDetails = "";
  if (res["release_date"]) {
    movieDetails = formatReleaseDate(res["release_date"]) + " (" + getProductionCountries(res["production_countries"], res["spoken_languages"]) + ") • " + getGenres(res["genres"]) + " • " + formatRuntime(res["runtime"]);
  } else {
    // If no release date, only include genres
    movieDetails = getGenres(res["genres"]);
  }
  document.getElementById("Movie Details").innerText = movieDetails;

  // Movie Tagline
  document.getElementById("Movie Tagline").innerText = res["tagline"];

  // Movie Poster
  var poster_path = res["poster_path"];
  if (poster_path != null) {
    var poster_url = getPoster(poster_path);
    document.getElementById("movie_page_image").src = poster_url;
  }

  // Movie Overview
  document.getElementById("movie_description_text").innerText = res["overview"];

  // Set document title
  document.title = document.getElementById("Movie Name").innerText;
}

function loadTrailer(data) {
  const videos = data.results;

  // Find the first video with the word "Trailer" in its title
  const trailerVideo = videos.find(video => video.name.toLowerCase().includes('trailer'));

  if (trailerVideo) {
    // Display the found trailer video on the page
    embedYouTubeVideo(trailerVideo.key, trailerVideo.type);
  }
}

// Function to embed YouTube videos
function embedYouTubeVideo(key, type) {
  const videoContainer = document.getElementById('video-container');

  // Create an iframe element for the YouTube video
  const iframe = document.createElement('iframe');
  iframe.width = '600';
  iframe.height = '338';
  iframe.src = `https://www.youtube.com/embed/${key}`;
  iframe.title = `${type}: ${key}`;
  iframe.allowFullscreen = true;

  // Append the iframe to the video container
  videoContainer.appendChild(iframe);

}

/**
 * Load reviews onto the page for a specific page number
 * @param {*} id - movie ID
 * @param {*} page - page number
 */
function loadReviewsPage(id, page) {
  let reviewURL = constructURL("movie/" + id + "/reviews", page, "&language=en-US");
  httpGet(reviewURL, 'json', loadReviews);
}


/**
 * Load reviews onto the page
 * @param {*} res - review json
 */
function loadReviews(res) {
  const reviewsContainer = document.getElementById("reviews_here");
  const totalReviewsElement = document.getElementById("total_reviews");

  if (res && res.results && res.results.length > 0) {
    // Set the total number of reviews
    totalReviewsElement.innerText = res.total_results;

    res.results.forEach(review => {
      const author = review.author;
      const authorDetails = review.author_details;
      const rating = authorDetails.rating;
      const avatarPath = authorDetails.avatar_path;
      let content = review.content;

      // Interpret text enclosed within underscores as italics
      content = content.replace(/_([^_]+)_/g, '<i>$1</i>');

      // Interpret text enclosed within double asterisks as bold
      content = content.replace(/\*\*([^\*]+)\*\*/g, '<b>$1</b>');

      // Interpret URLs and make them clickable
      content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

      // Construct the full URL for the avatar image
      let avatarHtml = '';
      if (avatarPath) {
        const imageUrl = "https://image.tmdb.org/t/p/w500/" + avatarPath;
        avatarHtml = `<img src="${imageUrl}" alt="${author} Avatar" class="avatar">`;
      } else {
        // Use default profile picture with centered letter and random color background
        const initials = author.charAt(0).toUpperCase();
        const randomColor = getRandomColor();
        avatarHtml = `<div class="avatar" style="background-color: ${randomColor};"><span>${initials}</span></div>`;
      }

      // Create a div to hold each review
      const reviewDiv = document.createElement("div");
      reviewDiv.classList.add("review");

      // Add author details and interpreted content to the review div
      let ratingText = "";
      if (rating !== null && rating !== undefined) {
        // Display rating with one decimal place
        ratingText = `(★ ${rating.toFixed(1)})`;
      }

      reviewDiv.innerHTML = `
        <div class="author-details">
          ${avatarHtml}
          <h3>${author} ${ratingText}</h3>
        </div>
        <p>${content}</p>
      `;

      // Append the review div to the reviews container
      reviewsContainer.appendChild(reviewDiv);
    });
  } else {
    // If no reviews are available
    totalReviewsElement.innerText = "0";
    reviewsContainer.innerHTML = "<p>No reviews available for this movie.</p>";
  }

  // Show the "Load More" button if there are more pages
  const loadMoreButton = document.getElementById("loadMoreButton");
  if (loadMoreButton) {
    loadMoreButton.style.display = res.page < res.total_pages ? "block" : "none";
  }
}


// Function to generate a random color
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Function to extract the year from the release date
function getReleaseYear(releaseDate) {
  if (releaseDate) {
    var year = new Date(releaseDate).getFullYear();
    return year;
  }
  return "";
}

function formatReleaseDate(releaseDate) {
  const date = new Date(`${releaseDate}T00:00:00Z`);
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${month}/${day}/${year}`;
}

// function getMainProductionCountries(productionCompanies) {
//   if (productionCompanies && productionCompanies.length > 0) {
//     return productionCompanies[0].origin_country;
//   }
//   return "";
// }

function getProductionCountries(productionCountries, spokenLanguages) {
  // Default values
  let productionCountry = "US";

  if (productionCountries && productionCountries.length > 0) {
    // Check if "US" is present among the production countries
    const includesUS = productionCountries.some(country => country.iso_3166_1 === "US");

    if (!includesUS) {
      // Find the ISO 3166-1 code of the first non-US production country
      const nonUSCountry = productionCountries.find(country => country.iso_3166_1 !== "US");

      productionCountry = nonUSCountry ? nonUSCountry.iso_3166_1 : "US";
    }
  }

  if (spokenLanguages && spokenLanguages.length > 0) {
    // Check if any spoken language is English
    const includesEnglish = spokenLanguages.some(language => language.english_name === "English");

    if (includesEnglish) {
      productionCountry = "US";
    }
  }
  return productionCountry;
}


function getGenres(genreList) {
  return genreList.map(genre => genre.name).join(', ');
}

function formatRuntime(minutes) {
  if (typeof minutes !== 'number' || isNaN(minutes)) {
    return 'N/A';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const hoursString = hours > 0 ? `${hours}h` : '';
  const minutesString = remainingMinutes > 0 ? ` ${remainingMinutes}m` : '';

  return hoursString + minutesString;
}

/**
 * load directors onto the movie page
 * @param {json} jsonResults - Results from the API query
 * @author Luke Davis
 */
function loadDirectors(jsonResults) {
  // console.log("loading directors");
  // check that crew array is not empty
  if (jsonResults.crew.length == 0) {
    let parent = document.getElementById("director_here");
    let no_director = new TextElement("No known directors.", "h3", parent, []);
    return;
  }

  //creates a vertical deck
  let directors = new HorizontalDeck(
    document.getElementById("director_here"),
    "default_person.png"
  );
  for (let i = 0; i < jsonResults.crew.length; i++) {
    // loop through entire crew
    if (jsonResults.crew[i].job == "Director") {
      let name = jsonResults.crew[i].name;
      let imageFilename = jsonResults.crew[i].profile_path;
      let imageUrl = "https://image.tmdb.org/t/p/w500/" + imageFilename;
      let link = "people_page.html?id=" + jsonResults.crew[i].id;
      directors.addCard(
        name,
        imageUrl,
        link
      );
    }
  }
}

/**
 * load actors onto the movie page
 * @param {json} jsonResults - json results from the API
 * @author Luke Davis
 */
function loadActors(jsonResults) {
  // console.log("loading actors");
  // check that cast array is not empty
  if (jsonResults.cast.length == 0) {
    let parent = document.getElementById("actors_here");
    let no_actor = new TextElement("No known actors.", "h3", parent, []);
    return;
  }

  let actors = new HorizontalDeck(
    document.getElementById("actors_here"),
    "default_person.png"
  );

  for (let i = 0; i < jsonResults.cast.length; i++) {
    let name = jsonResults.cast[i].name + " as " + jsonResults.cast[i].character;
    let imageFilename = jsonResults.cast[i].profile_path;
    let imageUrl = "https://image.tmdb.org/t/p/w500/" + imageFilename;
    let link = "people_page.html?id=" + jsonResults.cast[i].id;
    actors.addCard(
      name,
      imageUrl,
      link
    );
  }
}

/**
 * load buttons onto the movie page
 * @author Luke Davis
 */
function loadButtons(id) {
  let keyval = new Keyval();
  // check that the user is logged in
  if (localStorage.getItem('logged_in_user') != "") {
    // show bookmark button
    let bookmarkButton = new Button("Watch Later", document.getElementById("buttons"), [], {}, bookmarkMovie);
    bookmarkButton.setAttribute("id", "bookmark-movie-button");
    bookmarkButton.setAttribute("class", "bookmark-default"); // Use the same class for both buttons

    // show watchlist button
    let watchlistButton = new Button("Add to Watched List", document.getElementById("buttons"), [], {}, watchlistMovie);
    watchlistButton.setAttribute("id", "watchlist-movie-button");
    watchlistButton.setAttribute("class", "watchlist-default"); // Use the same class for both buttons

    // show favorite button
    let favoriteButton = new Button("❤️", document.getElementById("buttons"), [], {}, favoriteMovie);
    favoriteButton.setAttribute("id", "favorite-movie-button");
    favoriteButton.setAttribute("class", "favorite-default"); // Use the same class for all buttons

    // get and check bookmarks
    keyval.get("user-" + localStorage.getItem('logged_in_user'),
      function (results) {
        jsonResults = JSON.parse(results);

        // loop through results
        for (let i = 0; i < jsonResults.user_info[0].bookmarked_movies.length; i++) {
          // check if the current movie is found in the list
          if (jsonResults.user_info[0].bookmarked_movies[i] == id) {
            // change style and text for bookmark button
            document.getElementById("bookmark-movie-button").setAttribute("class", "movie-bookmarked"); // Adjust the class for the clicked state
            document.getElementById("bookmark-movie-button").innerText = "Added to Watch Later";

            // hide the watchlist button
            // document.getElementById("watchlist-movie-button").style.display = "none";
            return;
          }
        }

        // If movie is not bookmarked, show the bookmark button
        document.getElementById("bookmark-movie-button").style.display = "inline-block";
      },
      function () {
        console.log("Error checking if movie is bookmarked.");
      }
    );

    // get and check watchlist
    keyval.get("user-" + localStorage.getItem('logged_in_user'),
      function (results) {
        jsonResults = JSON.parse(results);
        // loop through results
        for (let i = 0; i < jsonResults.user_info[0].watchlist.length; i++) {
          // check if the current movie is found in the list
          if (jsonResults.user_info[0].watchlist[i] == id) {
            // change style and text for bookmark button
            // change style and text for watchlist button
            document.getElementById("watchlist-movie-button").setAttribute("class", "movie-watched"); // Adjust the class for the clicked state
            document.getElementById("watchlist-movie-button").innerText = "Added to Watched List";

            // show the watchlist button
            document.getElementById("watchlist-movie-button").style.display = "inline-block";
            return;
          }
        }

        // If movie is not in the watchlist, show the watchlist button
        document.getElementById("watchlist-movie-button").style.display = "inline-block";
      },
      function () {
        console.log("Error checking if movie is on the watch list.");
      }
    );


    // get and check favorites
    keyval.get("user-" + localStorage.getItem('logged_in_user'),
      function (results) {
        jsonResults = JSON.parse(results);

        // loop through results
        for (let i = 0; i < jsonResults.user_info[0].favorite_movies.length; i++) {
          // check if the current movie is found in the list
          if (jsonResults.user_info[0].favorite_movies[i] == id) {
            // change style and text for favorite button
            document.getElementById("favorite-movie-button").setAttribute("class", "movie-favorited"); // Adjust the class for the clicked state
            document.getElementById("favorite-movie-button").innerText = "Movie favorited";


            // show the favorite button
            document.getElementById("favorite-movie-button").style.display = "inline-block";
            return;
          }
        }

        // If movie is not favorited, show the favorite button
        document.getElementById("favorite-movie-button").style.display = "inline-block";
      },
      function () {
        console.log("Error checking if movie is favorited.");
      }
    );

  }
}

/**
 * check that keyval is populated calls setBookmarks to add/remove bookmarks
 * @param {button_event} event - entire result when button is pressed (not used)
 * @author Luke Davis
 */
function bookmarkMovie(event) {
  keyval = new Keyval();

  // get button
  let button = document.getElementById(event.srcElement.id);
  // get id from url
  var urlSearchParameters = new URLSearchParams(window.location.search);
  var id = urlSearchParameters.get('id');

  // get logged in user
  let loggedInUserID = localStorage.getItem('logged_in_user');

  console.log("Adding bookmark...");

  keyval.get("user-" + loggedInUserID,
    (results) => {
      // console.log(results);
      // parse the JSON
      jsonResults = JSON.parse(results);

      setBookmarks(jsonResults, id);
    },
    function (results) {
      console.log("Critical Error occured when retrieving bookmarks: " + results);
    }
  );

  // keyval url
  // let current_bookmarks = constructKeyvalURL(loggedInUser + "-bookmarks");

  // httpGet(current_bookmarks, 'json', false,
  //   // successfully found bookmarks
  //   function(res) {
  //     foundBookmarks(res, id);
  //   }, 
  //   // no bookmarks found
  //   function(res) {
  //     noBookmarks(id);
  //   }
  // );
}

/**
 * add or remove given movie to full list of movies in keyval
 * @param {JSON} jsonResults - results in form of json from keyval
 * @param {string} movieID - ID of movie to add
 * @author Luke Davis
 */
function setBookmarks(jsonResults, movieID) {
  keyval = new Keyval();

  // find which user is logged in
  let loggedInUserID = localStorage.getItem('logged_in_user');
  // create empy array for movies
  let bookmarks = [];
  // checks if movie should be removed
  let remove = false;

  // debug print statement
  // console.log(jsonResults.user_info[0].bookmarked_movies);

  // loop through json result given in argument
  for (let i = 0; i < jsonResults.user_info[0].bookmarked_movies.length; i++) {
    // check if id equals a current item
    if (jsonResults.user_info[0].bookmarked_movies[i] != movieID) {
      // does not equal so add to array
      // console.log(bookmarkArray[i]);
      bookmarks.push(jsonResults.user_info[0].bookmarked_movies[i]);
    } else {
      // equals current move so remove
      remove = true;
    }
  }

  // check if needs to be removed
  if (!remove) {
    // push movie to bookmark array
    bookmarks.push(movieID);
  } else {
    // removed the current movie
    // create the new JSON string
    let newJSON = changeUserJSON(
      loggedInUserID,
      jsonResults.user_info[0].username,
      jsonResults.user_info[0].password,
      jsonResults.user_info[0].bio,
      jsonResults.user_info[0].favorite_movies,
      jsonResults.user_info[0].favorite_genres,
      jsonResults.user_info[0].favorite_people,
      bookmarks,
      jsonResults.user_info[0].watchlist,
      jsonResults.user_info[0].friends,
      jsonResults.user_info[0].friend_requests,
      jsonResults.user_info[0].profile_pic
    );

    // set to keyval
    keyval.set("user-" + loggedInUserID, newJSON,
      function () {
        // change the button style
        document.getElementById("bookmark-movie-button").setAttribute("class", "bookmark-default");
        document.getElementById("bookmark-movie-button").innerText = "Add to Watch Later";
        alert("Movie removed from watch later list");
      }, function () {
        console.log("Error removing watch later/bookmarks.");
      }
    );

    // print out bookmarks (used for debugging)
    // console.log("Removed bookmarks:")
    // console.log(bookmarks);
    return;
  }

  // print out bookmarks (used for debugging)
  // console.log("Added bookmark:");
  // console.log(bookmarks);

  // create the new JSON string with new bookmarks
  let newJSON = changeUserJSON(
    loggedInUserID,
    jsonResults.user_info[0].username,
    jsonResults.user_info[0].password,
    jsonResults.user_info[0].bio,
    jsonResults.user_info[0].favorite_movies,
    jsonResults.user_info[0].favorite_genres,
    jsonResults.user_info[0].favorite_people,
    bookmarks,
    jsonResults.user_info[0].watchlist,
    jsonResults.user_info[0].friends,
    jsonResults.user_info[0].friend_requests,
    jsonResults.user_info[0].profile_pic
  );

  // set keyval
  keyval.set("user-" + loggedInUserID, newJSON,
    function () {
      document.getElementById("bookmark-movie-button").setAttribute("class", "movie-bookmarked");
      document.getElementById("bookmark-movie-button").innerText = "Added to Watch Later";
    }, function () {
      console.log("Error setting new bookmarks/adding to watch later.");
    }
  );
}

/**
 * checks that keyval is valid and then calls setWatchlist to add/remove movies
 * @param {button_event} event - entire result when button is pressed (not used)
 * @author Luke Davis
 */
function watchlistMovie(event) {
  keyval = new Keyval();

  // get button
  let button = document.getElementById(event.srcElement.id);
  // get id from url
  var urlSearchParameters = new URLSearchParams(window.location.search);
  var id = urlSearchParameters.get('id');

  // get logged in user
  let loggedInUserID = localStorage.getItem('logged_in_user');

  console.log("Adding to watchlist..." + loggedInUserID);

  keyval.get("user-" + loggedInUserID,
    (results) => {
      console.log(results);
      // parse the JSON
      jsonResults = JSON.parse(results);

      setWatchlist(jsonResults, id);
    },
    function (results) {
      console.log("Critical Error occured when retrieving bookmarks: " + results);
    }
  );
}

/**
 * add or remove movie from full watchlist of user
 * @param {JSON} jsonResults - results in form of json from keyval
 * @param {string} movieID - ID of movie
 * @author Luke Davis
 */
function setWatchlist(jsonResults, movieID) {
  keyval = new Keyval();

  let loggedInUserID = localStorage.getItem('logged_in_user');
  // let current_watchlist = constructKeyvalURL(loggedInUser + "-watchlist");
  // create empy array for movies
  let watchlist = [];
  // checks if omvie should be removed
  let remove = false;

  // loop through json result given in argument
  for (let i = 0; i < jsonResults.user_info[0].watchlist.length; i++) {
    // check if id equals a current item
    if (jsonResults.user_info[0].watchlist[i] != movieID) {
      // does not equal so add to 
      // console.log(jsonResults[i]);
      watchlist.push(jsonResults.user_info[0].watchlist[i]);
    } else {
      remove = true;
    }
  }

  // check if needs to be removed
  if (!remove) {
    // push movie to bookmark array
    watchlist.push(movieID);
  } else {
    // create the new JSON string
    let newJSON = changeUserJSON(
      loggedInUserID,
      jsonResults.user_info[0].username,
      jsonResults.user_info[0].password,
      jsonResults.user_info[0].bio,
      jsonResults.user_info[0].favorite_movies,
      jsonResults.user_info[0].favorite_genres,
      jsonResults.user_info[0].favorite_people,
      jsonResults.user_info[0].bookmarked_movies,
      watchlist,
      jsonResults.user_info[0].friends,
      jsonResults.user_info[0].friend_requests,
      jsonResults.user_info[0].profile_pic
    );

    // set to keyval
    keyval.set("user-" + loggedInUserID, newJSON,
      function () {
        // change the button style
        document.getElementById("watchlist-movie-button").setAttribute("class", "watchlist-default");
        document.getElementById("watchlist-movie-button").innerText = "Add to Watched List";
        alert("Movie removed from watched list.");
      }, function () {
        console.log("Error removing movie from watchlist.");
      }
    );

    return;
  }

  // create the new JSON string
  // create the new JSON string
  let newJSON = changeUserJSON(
    loggedInUserID,
    jsonResults.user_info[0].username,
    jsonResults.user_info[0].password,
    jsonResults.user_info[0].bio,
    jsonResults.user_info[0].favorite_movies,
    jsonResults.user_info[0].favorite_genres,
    jsonResults.user_info[0].favorite_people,
    jsonResults.user_info[0].bookmarked_movies,
    watchlist,
    jsonResults.user_info[0].friends,
    jsonResults.user_info[0].friend_requests,
    jsonResults.user_info[0].profile_pic
  );

  // set to keyval
  keyval.set("user-" + loggedInUserID, newJSON,
    function () {
      // change the button style
      document.getElementById("watchlist-movie-button").setAttribute("class", "movie-watched");
      document.getElementById("watchlist-movie-button").innerText = "Added to Watched List";
    }, function () {
      console.log("Error adding movie from watchlist.");
    }
  );
}

/**
 * check that keyval is populated calls setFavorites to add/remove favorites
 * @param {button_event} event - entire result when button is pressed (not used)
 */
function favoriteMovie(event) {
  keyval = new Keyval();

  // get button
  let button = document.getElementById(event.srcElement.id);
  // get id from URL
  var urlSearchParameters = new URLSearchParams(window.location.search);
  var id = urlSearchParameters.get('id');

  // get logged in user
  let loggedInUserID = localStorage.getItem('logged_in_user');

  console.log("Adding to favorites...");

  keyval.get("user-" + loggedInUserID,
    (results) => {
      // parse the JSON
      jsonResults = JSON.parse(results);

      setFavorites(jsonResults, id);
    },
    function (results) {
      console.log("Critical Error occurred when retrieving favorites: " + results);
    }
  );
}

/**
 * add or remove given movie to full list of movies in keyval
 * @param {JSON} jsonResults - results in the form of JSON from keyval
 * @param {string} movieID - ID of the movie to add/remove
 */
function setFavorites(jsonResults, movieID) {
  keyval = new Keyval();

  // find which user is logged in
  let loggedInUserID = localStorage.getItem('logged_in_user');
  // create empty array for movies
  let favorites = [];
  // checks if movie should be removed
  let remove = false;

  // loop through json result given in argument
  for (let i = 0; i < jsonResults.user_info[0].favorite_movies.length; i++) {
    // check if ID equals a current item
    if (jsonResults.user_info[0].favorite_movies[i] != movieID) {
      // does not equal so add to array
      favorites.push(jsonResults.user_info[0].favorite_movies[i]);
    } else {
      // equals current movie, so remove
      remove = true;
    }
  }

  // check if it needs to be removed
  if (!remove) {
    // push movie to favorites array
    favorites.push(movieID);
  } else {
    // remove the current movie
    // create the new JSON string
    let newJSON = changeUserJSON(
      loggedInUserID,
      jsonResults.user_info[0].username,
      jsonResults.user_info[0].password,
      jsonResults.user_info[0].bio,
      favorites,
      jsonResults.user_info[0].favorite_genres,
      jsonResults.user_info[0].favorite_people,
      jsonResults.user_info[0].bookmarked_movies,
      jsonResults.user_info[0].watchlist,
      jsonResults.user_info[0].friends,
      jsonResults.user_info[0].friend_requests,
      jsonResults.user_info[0].profile_pic
    );

    // set to keyval
    keyval.set("user-" + loggedInUserID, newJSON,
      function () {
        // change the button style
        document.getElementById("favorite-movie-button").setAttribute("class", "favorite-default");
        document.getElementById("favorite-movie-button").innerText = "❤️";
        alert("Movie removed from favorites");
      }, function () {
        console.log("Error removing favorites.");
      }
    );

    return;
  }

  // create the new JSON string with new favorites
  let newJSON = changeUserJSON(
    loggedInUserID,
    jsonResults.user_info[0].username,
    jsonResults.user_info[0].password,
    jsonResults.user_info[0].bio,
    favorites,
    jsonResults.user_info[0].favorite_genres,
    jsonResults.user_info[0].favorite_people,
    jsonResults.user_info[0].bookmarked_movies,
    jsonResults.user_info[0].watchlist,
    jsonResults.user_info[0].friends,
    jsonResults.user_info[0].friend_requests,
    jsonResults.user_info[0].profile_pic
  );

  // set keyval
  keyval.set("user-" + loggedInUserID, newJSON,
    function () {
      document.getElementById("favorite-movie-button").setAttribute("class", "movie-favorited");
      document.getElementById("favorite-movie-button").innerText = "Movie favorited";
    }, function () {
      console.log("Error setting new favorites.");
    }
  );
}


/**
 * Set window to people_page.hmtl and pass id in URL
 */
function personClicked() {
  currentID = event.target.id;
  // console.log(currentID);
  window.location.href = "people_page.html?id=" + currentID;
}


let redirectButton = document.querySelector(".redirectToDiscussion");
redirectButton.addEventListener("click", () => {
  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get("id");

  let movieName = document.querySelector(".movie_title").innerHTML;
  window.location.replace(`message_page.html?title=${movieName}&id=${id}`);
});
