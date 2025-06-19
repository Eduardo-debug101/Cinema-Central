// JS for people_page.html

/**
 * Request movie information from TMDB API based on id in URL
 */
function newPeoplePageParams() {
  // get parameters from url
  var urlSearchParameters = new URLSearchParams(window.location.search);
  var id = urlSearchParameters.get('id');
  if (id) {
    currentID = id;
    console.log(currentID);
  }

  var personURL = constructURL("person/" + id, 1, null);

  httpGet(personURL, 'json', loadPerson);

  let movieURL = constructURL("person/" + id, 1, "append_to_response=movie_credits");

  httpGet(movieURL, 'json', loadOtherMovies);


  httpGet(personURL, 'json', function (results) {
    loadPerson(results); // Load person data
  });
  addFavoriteButton(id);
}

/**
 * loads other movies that the person is involved with
 * @param {JSON} jsonResults - results to parse from tmdb
 * @author Luke Davis
 */
function loadOtherMovies(jsonResults) {
  // checks that there are other movies
  if (jsonResults.movie_credits.cast.length == 0 && jsonResults.movie_credits.crew.length == 0) {
    let parent = document.getElementById("movies_here");
    // if no other movies display a message
    let no_movies = new TextElement("No known movies.", "h3", parent, []);
    return;
  }

  // create new deck
  let movies = new HorizontalDeck(
    document.getElementById("movies_here"),
    "default_movie.jpg"
  );

  // loop through all the movies where person is in cast first
  for (let i = 0; i < jsonResults.movie_credits.cast.length; i++) {
    let title = jsonResults.movie_credits.cast[i].original_title;
    let imageFilename = jsonResults.movie_credits.cast[i].poster_path;
    let imageUrl = "https://image.tmdb.org/t/p/w500/" + imageFilename;
    let link = "movie_page.html?id=" + jsonResults.movie_credits.cast[i].id;
    movies.addCard(
      title,
      imageUrl,
      link
    );
  }

  // loop through where person is in the crew
  for (let i = 0; i < jsonResults.movie_credits.crew.length; i++) {
    let title = jsonResults.movie_credits.crew[i].original_title;
    let imageFilename = jsonResults.movie_credits.crew[i].poster_path;
    let imageUrl = "https://image.tmdb.org/t/p/w500/" + imageFilename;
    let link = "movie_page.html?id=" + jsonResults.movie_credits.crew[i].id;
    movies.addCard(
      title,
      imageUrl,
      link
    );
  }
}

/**
 * Set element on page to reflect the selected person
 * @param {*} res - data from event
 * @author Luke Davis
 */
function loadPerson(results) {
  // console.log(results);
  // set person name
  document.getElementById("person_name").innerText = results.name;

  // check if picture is available
  if (results.profile_path != null) {
    var poster_path = results.profile_path;
    var poster_url = getPoster(poster_path);
    document.getElementById("person_page_image").src = poster_url;
  }

  // check if biography is available
  if (results.biography != "") {
    document.getElementById("person_bio_text").innerText = results.biography;
  }
}

/**
 * Adds a favorite button with a heart emoji to the movie_page_left section based on person's role.
 * 
 */
function addFavoriteButton(id) {
  keyval = new Keyval();

  if (localStorage.getItem('logged_in_user') != "") {
    let favoriteButton = new Button("❤️", document.getElementById("buttons"), [], {}, favoritePerson);
    favoriteButton.setAttribute("id", "favorite-person-button");
    favoriteButton.setAttribute("class", "favorite-default");

    keyval.get("user-" + localStorage.getItem('logged_in_user'),
      function (results) {
        jsonResults = JSON.parse(results);

        // loop through results
        for (let i = 0; i < jsonResults.user_info[0].favorite_people.length; i++) {
          if (jsonResults.user_info[0].favorite_people[i] == id) {
            document.getElementById("favorite-person-button").setAttribute("class", "movie-bookmarked");
            document.getElementById("favorite-person-button").innerText = "Person Favorited";
            return;
          }
        }


        document.getElementById("favorite-person-button").style.display = "inline-block";
      },
      function () {
        console.log("Error checking if person is favorited.");
      }
    );
  }
}

function favoritePerson(personId) {
  console.log('Favoriting person with ID:', personId);
  keyval = new Keyval();

  // get button
  let button = document.getElementById(personId.srcElement.id);
  // get id from url
  var urlSearchParameters = new URLSearchParams(window.location.search);
  var id = urlSearchParameters.get('id');

  // get logged in user
  let loggedInUserID = localStorage.getItem('logged_in_user');

  console.log("Adding person...");

  keyval.get("user-" + loggedInUserID,
    (results) => {
      // console.log(results);
      // parse the JSON
      jsonResults = JSON.parse(results);

      setFavoritePerson(jsonResults, id);
    },
    function (results) {
      console.log("Critical Error occured when retrieving favorite person: " + results);
    }
  );
}

/**
 * Add or remove given people to/from the list of favorite people in keyval
 * @param {JSON} jsonResults - Results in the form of JSON from keyval
 * @param {string} personID - ID of the people to add or remove
 */
function setFavoritePerson(jsonResults, personID) {
  keyval = new Keyval();


  let loggedInUserID = localStorage.getItem('logged_in_user');

  let favoritePerson = [];
  let remove = false;

  for (let i = 0; i < jsonResults.user_info[0].favorite_people.length; i++) {
    if (jsonResults.user_info[0].favorite_people[i] != personID) {
      favoritePerson.push(jsonResults.user_info[0].favorite_people[i]);
    } else {
      remove = true;
    }
  }

  if (!remove) {
    favoritePerson.push(personID);
  } else {
    let newJSON = changeUserJSON(
      loggedInUserID,
      jsonResults.user_info[0].username,
      jsonResults.user_info[0].password,
      jsonResults.user_info[0].bio,
      jsonResults.user_info[0].favorite_movies,
      jsonResults.user_info[0].favorite_genres,
      favoritePerson,
      jsonResults.user_info[0].bookmarked_movies,
      jsonResults.user_info[0].watchlist,
      jsonResults.user_info[0].friends,
      jsonResults.user_info[0].friend_requests,
      jsonResults.user_info[0].profile_pic
    );

    keyval.set("user-" + loggedInUserID, newJSON,
      function () {
        document.getElementById("favorite-person-button").setAttribute("class", "favorite-default");
        document.getElementById("favorite-person-button").innerText = "❤️";
        alert("Person removed.");
      }, function () {
        console.log("Error removing person.");
      }
    );
    return;
  }

  let newJSON = changeUserJSON(
    loggedInUserID,
    jsonResults.user_info[0].username,
    jsonResults.user_info[0].password,
    jsonResults.user_info[0].bio,
    jsonResults.user_info[0].favorite_movies,
    jsonResults.user_info[0].favorite_genres,
    favoritePerson,
    jsonResults.user_info[0].bookmarked_movies,
    jsonResults.user_info[0].watchlist,
    jsonResults.user_info[0].friends,
    jsonResults.user_info[0].friend_requests,
    jsonResults.user_info[0].profile_pic
  );

  keyval.set("user-" + loggedInUserID, newJSON,
    function () {
      document.getElementById("favorite-person-button").setAttribute("class", "movie-bookmarked");
      document.getElementById("favorite-person-button").innerText = "Person Favorited";
    }, function () {
      console.log("Error removing person.");
    }
  );
}