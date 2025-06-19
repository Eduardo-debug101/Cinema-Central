let keyval;
let cinema_logo;

let RESULTS = {};
let currentID = 0;

// DATA FROM/FOR TMDB API
let tmdbJSON = null;  // JSON recieved from TMDB
const tmdbBaseURL = "https://api.themoviedb.org/3/";

let keyvalURL = "https://keyval.learnscrum.xyz/keystore/";
let keyvalAppend = "?apikey=";

let display_username = false;
let username = "";
let profileImage = "";

/**
 * Loads before page begins
 */
/**
 * Runs once
 */
function setup() {
  noCanvas();
  cinema_logo = loadImage("assets/CC_logo.png") // Loads logo

  // Get initial JSON from TMDB before page loads
  tmdbJSON = loadJSON(constructURL("movie/popular", "1", null),
    // function for when file is loaded
    function () {
      // print to console
      //console.log("TMDB popular movies JSON loaded.");
    }
  );

  // display_username = (getItem('logged_in_user') != null);
  // const profileImage = document.getElementById('profile-picture');

  // if (display_username) {
  //   // username = getItem('logged_in_user');
  //   // document.getElementById("login_header_button").style.setProperty('display', 'none');
  //   // document.getElementById("username_header").style.setProperty('display', 'block');
  //   // document.getElementById("logout_header_button").style.setProperty('display', 'block');
  //   // document.getElementById("username_header").textContent = username;
  // }
  // else {
  //   // username = "";
  //   // document.getElementById("login_header_button").style.setProperty('display', 'block');
  //   // document.getElementById("username_header").style.setProperty('display', 'none');
  //   // document.getElementById("logout_header_button").style.setProperty('display', 'none');
  //   // document.getElementById("username_header").textContent = "";
  //   // if (profileImage) profileImage.style.display = 'none';
  // }
  // const loggedInUser = getItem('logged_in_user');
  // if (loggedInUser) {
  //   const url = constructKeyvalURL('profile_pic_' + loggedInUser);

  //   httpGet(url, 'text', function (result) {

  //     if (result) {
  //       // profileImage = result;
  //       // const profileImage = document.getElementById('profile-picture');
  //       // if (profileImage) {
  //       //   profileImage.src = result;
  //       //   profileImage.style.display = 'block';
  //       // }
  //     }
  //   }, function (error) {
  //     console.error('Error fetching profile picture:', error);
  //   });
  // }

}

/**
 * Combines necessary elements to construct a TMDB API URL.
 * @param {string} category - string for category or id
 * @param {string} page - page of query
 * @param {string} other - (key=value) extra key-value pair query elements 
 *                 (separate paris with "&"), pass null if no additions
 *                 Example: query=Batman&callback=test
 * @returns string of fully constructed URL to load TMDB JSON.
 *          Example: https://api.themoviedb.org/3/{category}?page={page}&{other}&language=en&api_key={api_key}
 * @author Luke Davis
 */
function constructURL(category, page, other) {
  // no additional query information
  if (other == null) {
    return tmdbBaseURL + category + "?page=" + page +
      "&include_adult=false&language=en&api_key=" + TMDB_API_KEY
  }
  if (category === "search/movie") {
    return tmdbBaseURL + category + "?" + other + "&include_adult=false&language=en-US&page=" + page +
      "&language=en&api_key=" + TMDB_API_KEY
  }

  // append additional query information
  return tmdbBaseURL + "/" + category + "?page=" + page +
    "&" + other + "&include_adult=false&language=en&api_key=" + TMDB_API_KEY;
}

/**
 * Combines necessary elements to construct a Keyval API URL
 * @param {string} key - string for category
 * @returns string of fully constructed URL to load Keyval API.
 *          Example: https://keyval.learnscrum.xyz/keystore/{key}?api_key={api_key}
 * @author Cameron Barb
 */
function constructKeyvalURL(key) {
  // console.log("Value: " + keyvalAppend);
  final_url = keyvalURL + key + keyvalAppend + KEYVAL_API_KEY;
  return final_url;
}

/**
 * display list of movies with picture and title
 * @param {JSON} json - json given from TMDB API
 * @author Nischal Lawot
 */
function constructMovieList(json) {
  RESULTS = json.results;
  const container = document.createElement("div");
  for (let result of RESULTS) {
    let card = document.createElement("figure");
    let title_container = document.createElement("div");
    let card_title = document.createElement("figcaption");
    let image = document.createElement("img");
    container.appendChild(card);
    card.appendChild(image);
    card.appendChild(title_container);
    title_container.appendChild(card_title);
    card_title.appendChild(document.createTextNode(result.title));

    image.setAttribute("src", "https://image.tmdb.org/t/p/w500/" + result.poster_path);
    image.setAttribute("onclick", "movieClicked()");
    image.setAttribute("id", result.id);
  }

  document.getElementsByTagName("main")[0].appendChild(container);
}

/**
 * Construct poster URL
 * @param {string} poster_path - path of poster from TMDB json
 * @returns string of complete poster path
 * @author Cameron Barb
 */
function getPoster(poster_path) {
  if (poster_path) {
    return "https://image.tmdb.org/t/p/original" + poster_path;
  }
}

// Redirect to the profile page
function redirectToProfilePage() {
  window.location.href = 'profile_page.html';
}

// Set the logged-in session
function setLoggedInSession(username) {
  keyval.set('logged_in_user', username, () => {
    console.log('User logged in session set successfully.');
  }, (error) => {
    console.error('Error setting logged in user:', error);
  });
}

/**
 * Clear logged in session
 */
function clearLoggedInSession() {
  keyval.set('logged_in_user', '', () => {
    console.log('User logged out session cleared successfully.');
  }, (error) => {
    console.error('Error clearing logged in user:', error);
  });
}

/**
 * Create new JSON string for user
 * @param {string} id - id of user (Should not change)
 * @param {string} username - users username
 * @param {string} password - users password
 * @param {string} bio - users bio
 * @param {array} favorite_movies - list of users favorite movies
 * @param {string} favorite_genres - string of users favorite genres (comma-separated)
 * @param {array} favorite_people - list of users favorite people
 * @param {array} bookmarked_movies - list of users bookmarks 
 * @param {array} watchlist - list of movies on users watchlist
 * @param {array} friends - list of users friends
 * @param {array} friend_requests - list of users friend requests
 * @param {string_path} profile_pic - path to users profile pic
 * @returns 
 */
function changeUserJSON(id, username, password, bio, favorite_movies,
  favorite_genres, favorite_people, bookmarked_movies,
  watchlist, friends, friend_requests, profile_pic) {
  return `{
    "user_info": [{
      "id": "${id}",
      "username": "${username}",
      "password": "${password}",
      "bio": "${bio}",
      "favorite_movies": [${favorite_movies}],
      "favorite_genres": [${favorite_genres.map(genre => `"${genre}"`).join(',')}],
      "favorite_people": [${favorite_people}],
      "bookmarked_movies": [${bookmarked_movies}],
      "watchlist": [${watchlist}],
      "friends": [${friends}],
      "friend_requests": [${friend_requests}],
      "profile_pic": "${profile_pic}"
    }]
  }`;
}