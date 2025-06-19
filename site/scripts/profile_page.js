/* 
  Profile_page.js:
  Manages user profiles, including UI updates, bio editing, and profile picture changes.
  Handles friend requests, allowing users to send, receive, accept, and reject requests.
  Utilizes key-value storage for user data and interacts with a server for friend-related actions.
*/

let cancel_changes = false;

// Friend list and request list are stored as plain string array. 
// MUST be converted to JSON before being sent to keyval for storage.
let friend_request_list = [];
let friend_request_name_list = [];
let friend_list = [];
let friend_name_list = [];

let friend_id = -1;

let friend_to_remove_id = -1;

let friends_friend_request_list = [];

let selectorValue;

let newUsername = "";
let newPassword = "";
let updatedBio;
let pictureSelector;

/**
 * On page load function
 * @authors everyone
 */
function loadProfilePage() {
  console.log("RUNNING SCRIPTS");
  updateFriendRequests();
  updateFriendList();
  loadFavoriteMovies();
  loadFavoriteGenres();
  loadWatchlistMovies();
  loadBookmarkedMovies();
  loadProfilePicture();
  loadBioInformation();
  loadFavoritePeople();
  // loadFavoriteActors();
  // loadFavoriteDirectors();
}

/**
 * sets style and displays elements when profile button is clicked
 * @author Luke Davis
 */
function showProfile() {
  document.getElementById("profile-only-button").className = "selected-standard-button";
  document.getElementById("favorites-button").className = "standard-button";
  document.getElementById("friends-button").className = "standard-button";
  document.getElementById("watching-button").className = "standard-button";

  cancel_changes = false;
  document.getElementById('edit-profile-button').innerText = "Edit Profile";

  document.getElementById("edit-controls").style.display = "none";
  document.getElementById("picture-edit-controls").style.display = "none";

  document.getElementById("all-friend-elements").style.display = "none";
  document.getElementById("favorites-section").style.display = "none";

  document.getElementById("profile-pic-div").style.display = "block";
  document.getElementById("profile-info").style.display = "block";

  document.getElementById("watching-movies").style.display = "none";
  document.getElementById("edit-profile-button").style.display = "flex";
}

/**
 * sets style and displays elements when favorites button is clicked
 * @author Luke Davis
 */
function showFavorites() {
  document.getElementById("profile-only-button").className = "standard-button";
  document.getElementById("favorites-button").className = "selected-standard-button";
  document.getElementById("friends-button").className = "standard-button";
  document.getElementById("watching-button").className = "standard-button";

  cancel_changes = false;
  document.getElementById('edit-profile-button').innerText = "Edit Profile";

  document.getElementById("edit-controls").style.display = "none";
  document.getElementById("picture-edit-controls").style.display = "none";

  document.getElementById("all-friend-elements").style.display = "none";
  document.getElementById("favorites-section").style.display = "block";

  document.getElementById("profile-pic-div").style.display = "none";
  document.getElementById("profile-info").style.display = "none";

  document.getElementById("watching-movies").style.display = "none";
  document.getElementById("edit-profile-button").style.display = "none";
}

/**
 * sets style and displays elements when watching button is clicked
 * @author Luke Davis
 */
function showWatching() {
  document.getElementById("profile-only-button").className = "standard-button";
  document.getElementById("favorites-button").className = "standard-button";
  document.getElementById("friends-button").className = "standard-button";
  document.getElementById("watching-button").className = "selected-standard-button";

  cancel_changes = false;
  document.getElementById('edit-profile-button').innerText = "Edit Profile";

  document.getElementById("edit-controls").style.display = "none";
  document.getElementById("picture-edit-controls").style.display = "none";

  document.getElementById("all-friend-elements").style.display = "none";
  document.getElementById("favorites-section").style.display = "none";

  document.getElementById("profile-pic-div").style.display = "none";
  document.getElementById("profile-info").style.display = "none";

  document.getElementById("watching-movies").style.display = "block";
  document.getElementById("edit-profile-button").style.display = "none";
}

/**
 * sets style and displays elements when friends button is clicked
 * @author Luke Davis
 */
function showFriends() {
  document.getElementById("profile-only-button").className = "standard-button";
  document.getElementById("favorites-button").className = "standard-button";
  document.getElementById("friends-button").className = "selected-standard-button";
  document.getElementById("watching-button").className = "standard-button";

  cancel_changes = false;
  document.getElementById('edit-profile-button').innerText = "Edit Profile";

  document.getElementById("edit-controls").style.display = "none";
  document.getElementById("picture-edit-controls").style.display = "none";

  document.getElementById("all-friend-elements").style.display = "block";
  document.getElementById("favorites-section").style.display = "none";

  document.getElementById("profile-pic-div").style.display = "none";
  document.getElementById("profile-info").style.display = "none";

  document.getElementById("watching-movies").style.display = "none";
  document.getElementById("edit-profile-button").style.display = "none";
}

/**
 * Personalized profile UI with username and bio
 * Calls display edit controls.
 * @authors Patrick Meyers and Luke Davis
 */
function updateProfileUI() {
  keyval = new Keyval(KEYVAL_API_KEY);

  const loggedInUserID = localStorage.getItem('logged_in_user');

  if (!loggedInUserID || loggedInUserID == 'null') {
    // redirectToLoginPage();
    return;
  }

  keyval.get("user-" + loggedInUserID,
    function (results) {
      let jsonResults = JSON.parse(results);

      // set username
      document.getElementById('username').textContent = jsonResults.user_info[0].username;

      // set bio
      document.getElementById('bio').textContent = jsonResults.user_info[0].bio;

      // displayEditControls();
    },
    function (error) {
      console.log("Error occured when retieving profile information: " + error);
    }
  );
}

/**
 * Shows bio edit controls
 * @author Patrick Meyers
 */
function displayEditControls() {
  keyval = new Keyval(KEYVAL_API_KEY);

  if (cancel_changes) {
    showProfile();
    // window.location.reload();
    return;
  }

  cancel_changes = !cancel_changes;

  document.getElementById('edit-profile-button').innerText = "Cancel";

  // Show the edit controls
  document.getElementById('edit-controls').style.display = 'block';
  document.getElementById('picture-edit-controls').style.display = 'block';
  document.getElementById("watching-movies").style.display = "none";

  keyval.get("user-" + localStorage.getItem('logged_in_user'),
    function (results) {
      let jsonResults = JSON.parse(results);

      document.getElementById("bio-edit").value = jsonResults.user_info[0].bio;
      document.getElementById("profile-picture-selector").value = jsonResults.user_info[0].profile_pic;
    },
    function (error) {
      console.log("Error setting bio in edit controls: " + error);
    }
  );

  // Set the current bio in the editable textarea
  // const currentBio = document.getElementById('bio').textContent;
  // document.getElementById('bio-edit').value = currentBio;
}

/**
 * Save change to profile
 * @author Patrick Meyers
 */
function saveProfileChanges() {
  updatedBio = document.getElementById('bio-edit').value;
  pictureSelector = document.getElementById('profile-picture-selector');
  selectorValue = pictureSelector.value;
  loggedInUserID = localStorage.getItem('logged_in_user');
  newUsername = document.getElementById('username-edit').value;
  newPassword = document.getElementById('password-edit').value;

  if (loggedInUserID) {
    // if (newUsername != "" || newUsername != document.getElementById('username').value) {
    //   updateUser(loggedInUserID, newUsername);
    // }

    if (newUsername != "" && newUsername != null)
    {
      updateUser(loggedInUserID, newUsername);
    }
    else if (newPassword != "" && newPassword != null){
      updatePass(loggedInUserID, newPassword);
    }
    else if (selectorValue != "") {
      updateProfilePicture();
    }
    else if (updatedBio != "") {
      saveBioInformation(updatedBio);
    }
    else{
      location.reload();
    }
  } else {
    redirectToLoginPage();
  }
  
}

/**
 * load bio to profile page
 * @authors Patrick Meyers and Luke Davis
 */
function loadBioInformation() {
  keyval = new Keyval(KEYVAL_API_KEY);

  const logged_in_user = localStorage.getItem('logged_in_user');
  if (logged_in_user) {
    keyval.get("user-" + logged_in_user,
      function (result) {
        let jsonResults = JSON.parse(result);

        console.log("Bio info returned: ", jsonResults.user_info[0].bio);
        document.getElementById('bio').textContent = jsonResults.user_info[0].bio;
      },
      function (error) {
        console.error('Error fetching bio:', error);
      }
    );
  }
}

function updateUser(id, newUsername) {
  keyval = new Keyval(KEYVAL_API_KEY);
  const loggedInUserID = veryifyLoggedInUser();

  console.log("getting here");
  keyval.get("user_list",
    function (results) {
      let jsonResults = JSON.parse(results);
      for (let i = 0; i < jsonResults.users.length; i++) {
        if (jsonResults.users[i].username == newUsername) {
          alert("Username already exists.");
          return;
        }
      }
      updateUserHelper(id, newUsername);
    }, function () {
      console.log("Error");
    }
  )
}

function updatePass(id, newPassword) {
  keyval = new Keyval(KEYVAL_API_KEY);
  const loggedInUserID = veryifyLoggedInUser();

  keyval.get("user_list",
  function(results) {
    let jsonResults = JSON.parse(results);
    for (let i = 0; i < jsonResults.users.length; i++) {
      if (jsonResults.users[i].id == id) {
        jsonResults.users[i].password = newPassword;
      }
    }
    keyval.set("user_list", JSON.stringify(jsonResults),
      function() {
        keyval.get("user-" + loggedInUserID,
        function(results) {
          let jsonResults = JSON.parse(results);
          jsonResults.user_info[0].password = newPassword;
          keyval.set("user-" + loggedInUserID, JSON.stringify(jsonResults),
          function() {
            alert("Password changed.");
            if (updatedBio != "") {
              saveBioInformation(updatedBio);
            }
            else if (selectorValue != "") {
              updateProfilePicture();
            }
            else{
              location.reload();
            }
          }
    
          );
        }
    
      );
      }
    );
  }
  );

}

function updateUserHelper(id, newUsername) {
  keyval = new Keyval(KEYVAL_API_KEY);
  const loggedInUserID = veryifyLoggedInUser();
  // if (!loggedInUserID) {
  //   return;
  // }

  // updating user info
  keyval.get("user-" + loggedInUserID,
    function (results) {
      keyval = new Keyval(KEYVAL_API_KEY);
      let jsonResults = JSON.parse(results);

      let oldUsername = jsonResults.user_info[0].username;
      // console.log("Successfully changed username for list 2");
      jsonResults.user_info[0].username = newUsername;

      keyval.set("user-" + loggedInUserID, JSON.stringify(jsonResults),
        function () {
          document.getElementById('username').innerText = newUsername;
          // update user list
          keyval.get("user_list",
          function (results) {
            keyval = new Keyval(KEYVAL_API_KEY);
            let jsonResults = JSON.parse(results);
            for (let i = 0; i < jsonResults.users.length; i++) {
              if (jsonResults.users[i].id == id) {
                jsonResults.users[i].username = newUsername;
              }
            }
            keyval.set("user_list", JSON.stringify(jsonResults),
              function () { 
                if (oldUsername == newUsername) {
                  alert("Notice: New username is the same as old username.");
                }
                else{
                  alert("Username changed.");
                }
                if (newPassword != null && newPassword != ""){
                  updatePass(loggedInUserID, newPassword);
                }
                else{
                  if (updatedBio != "") {
                    saveBioInformation(updatedBio);
                  }
                  else{
                    if (selectorValue != "") {
                      updateProfilePicture();
                    }
                    else{
                      location.reload();
                    }
                  }
                }
              }
            )
          }
        )
        updateProfileUI();
        }
      )
    }
  )
}

/**
 * Sets users bio to updateBio
 * @param {string} updatedBio - new bio to be updated to
 * @authors Patrick Meyers and Luke Davis
 */
function saveBioInformation(updatedBio) {
  keyval = new Keyval(KEYVAL_API_KEY);
  const logged_in_user = localStorage.getItem('logged_in_user');
  // const url = constructKeyvalURL('bio_' + loggedInUser);

  keyval.get("user-" + logged_in_user,
    function (results) {
      keyval = new Keyval(KEYVAL_API_KEY);

      let jsonResults = JSON.parse(results);

      jsonResults.user_info[0].bio = updatedBio;

      keyval.set("user-" + logged_in_user, JSON.stringify(jsonResults),
        function (result) {
          // window.location.reload();
          if (selectorValue != "") {
            updateProfilePicture();
          }
          else{
            location.reload();
          }
        },
        function (error) {
          // window.location.reload();
          loadBioInformation();
          console.log('Error updating bio: ' + error);
          showProfile();
        }
      );
    },
    function (error) {
      console.log("Error retrieving previous user information: " + error);
    }
  );
}

/**
 * update profile picture on screen before save change button pressed
 * @author Luke Davis
 */
function previewProfilePicture() {
  const selector = document.getElementById('profile-picture-selector');
  const newPicSrc = selector.value;

  document.getElementById('profile-picture2').src = newPicSrc;
}

/**
 * update profile image in keyval
 * @authors Patrick Meyers and Luke Davis
 */
function updateProfilePicture() {
  keyval = new Keyval(KEYVAL_API_KEY);

  const selector = document.getElementById('profile-picture-selector');
  const newPicSrc = selector.value;
  const loggedInUserID = localStorage.getItem('logged_in_user');
  // const url = constructKeyvalURL('profile_pic_' + loggedInUser);

  if (loggedInUserID) {
    keyval.get("user-" + loggedInUserID,
      function (result) {
        keyval = new Keyval(KEYVAL_API_KEY);
        let jsonResults = JSON.parse(result);
        jsonResults.user_info[0].profile_pic = newPicSrc;

        keyval.set("user-" + loggedInUserID, JSON.stringify(jsonResults),
          function () {
            console.log('Profile picture updated.');
            document.getElementById('profile-picture2').src = newPicSrc;
            loadBioInformation();
            showProfile();
            location.reload();
          },
          function () {
            console.log("Error when setting profile picture.");
          })
      },
      function () {
        console.log("Error retrieving previously stored info from keyval.");
      }
    );
  }
}

/**
 * load profile pic from keyval onto page
 * @authors Patrick Meyers and Luke Davis
 */
function loadProfilePicture() {
  keyval = new Keyval(KEYVAL_API_KEY);
  const loggedInUserID = localStorage.getItem('logged_in_user');
  if (loggedInUserID) {
    // const url = constructKeyvalURL('profile_pic_' + loggedInUser);
    // httpGet(url, function(res) { document.getElementById('profile-picture2').src = res; }, 
    //   function(error) { console.error('Error fetching profile picture:', error); });

    keyval.get("user-" + loggedInUserID,
      function (result) {
        let jsonResults = JSON.parse(result);
        document.getElementById('profile-picture2').src = jsonResults.user_info[0].profile_pic;
      },
      function () {
        console.log("Error when fetching profile pic from keyval.");
      }
    );
  }
}

/**
 * set current window to login page
 */
function redirectToLoginPage() {
  window.location.href = 'login.html';
}

// FRIEND REQUEST SCRIPTS -----------------------------------------------------------------------------------

///////// Reusable Utilities

/**
 * Script that tests whether a valid user is logged in.
 * @returns : The current logged in user
 * @author: Cameron Barb
**/
function veryifyLoggedInUser() {
  const loggedInUser = localStorage.getItem('logged_in_user');
  if (!loggedInUser || loggedInUser == 'null') {
    return;
  }
  else {
    return loggedInUser;
  }
}

///////// Update friend request and friends lists onload

/**
 * Called when profile page loads.
 * 
 * Attempts to get friend request list from keyval.
 * If successful, renders friend request list.
 * 
 * If unsuccessful, creates empty friend request list.
 * @author: Cameron Barb
**/
function updateFriendRequests() {
  // Get logged in user and make sure someone is logged in
  const loggedInUser = veryifyLoggedInUser();

  // Create keyval object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Get friend request list from keyval
  keyval.get("user-" + loggedInUser, function (result) {
    // Parse JSON result
    let jsonResults = JSON.parse(result);

    // Get friend request list from user data
    friend_request_list = jsonResults.user_info[0].friend_requests;

    console.log("Updated friend request list: ", friend_request_list);

    // Update friend request list
    friendRequestList();

  }, noRequestList)
}

/**
 * Called when profile page loads.
 * 
 * Attempts to get friend list. If it fails, calls noFriendList()
 * @author: Cameron Barb
**/
function updateFriendList() {
  // Get logged in user and make sure someone is logged in
  const loggedInUser = veryifyLoggedInUser();

  // Create keyval object
  let keyval = new Keyval(KEYVAL_API_KEY);

  keyval.get("user-" + loggedInUser, function (result) {
    // Parse JSON
    let jsonResults = JSON.parse(result)

    // Set friend list from JSON data
    friend_list = jsonResults.user_info[0].friends;

    // Log to console for debugging
    console.log("Friend list: " + JSON.stringify(friend_list));

    // Update friend list
    friendList();

  }, noFriendList);
}

/**
 * Error callback in case friend list dne for some reason
 * 
 * @author: Cameron Barb
**/
function noFriendList() {
  alert("Error, no friend list");
  console.log("Error, no friend list");
}

/**
 * Error callback function.
 * 
 * Alerts when attempting to load user friend requests,
 * but the user doesn't have a friend request list for some reason
 * @author: Cameron Barb
**/
function noRequestList() {
  alert("Error, no friend request list");
}

///////// Sending friend request functions

/**
 * Event function that gets whether the user has
 * hit the enter key in the friend request input.
 * 
 * If they have, gets input value, clears input box,
 * and checks whether destination user exists.
 * @param {event} event : Event details, used for checking key pressed.
 * @author: Cameron Barb
**/
function sendFriendRequest(event) {
  // Set friend username to null
  var friend_username = null;

  // Check if enter button pressed
  if (event.key == "Enter") {
    // Set friend_username to value in input
    friend_username = document.getElementById("friend_request_input").value;

    // Clear input box
    document.getElementById("friend_request_input").value = "";

    // Check valid input
    if (friend_username != null && friend_username != "") {

      // Create keyval object
      let keyval = new Keyval(KEYVAL_API_KEY);

      // Get user list and check for username
      keyval.get("user_list", function (result) {
        let jsonResults = JSON.parse(result);

        for (let i = 0; i < jsonResults.users.length; i++) {
          if (jsonResults.users[i].username == friend_username) {
            friend_id = jsonResults.users[i].id;
            friendExists();
            return;
          }
        }
        // Alert user that the friend is not valid
        alert("Invalid username. Please try again.");
      })
    }
  }
}

/**
 * @description:
 * Called by sendFriendRequest() if it successfully finds the username on the user_list.
 * 
 * Verifies the legitimacy of the friend request, alerting and returning if invalid.
 * 
 * If valid, pushes the user onto the destination user's friend list and calls
 * addToFriendRequestList() to update the server with the new JSON.
 * @author: Cameron Barb
**/
function friendExists() {
  // Create keyval object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Get logged in user
  let logged_in_user = veryifyLoggedInUser();

  // Get the user data of the friend
  keyval.get("user-" + friend_id, function (result) {
    let friend_json = JSON.parse(result)
    friends_friend_request_list = friend_json.user_info[0].friend_requests;

    // Deny if sending to self
    if (friend_id == logged_in_user) {
      alert("You can't send a friend request to yourself. Fool.");
      return;
    }

    // Deny if friend already on friend list
    if (friend_list.includes(friend_id)) {
      alert("You can't send a friend request to a user that is already on your friends list.");
      return;
    }

    // Deny if friend request from that user is pending
    if (friend_request_list.includes(friend_id)) {
      alert("You can't send a friend request to this user as you have a pending friend request from them.");
      return;
    }

    // Deny if already on friend's friend request list
    if (!friends_friend_request_list.includes(logged_in_user)) {
      friends_friend_request_list.push(logged_in_user);
      friend_json.user_info.friend_requests = friends_friend_request_list;
      addToFriendRequestList(friend_json);
    }
    else {
      // Alert that friend request is already sent.
      alert("You already sent a friend request to this user!");
    }
  })
}

/**
 * Adds logged in user to destination friend request list, alerts
 * warning if already added.
 * @param {JSON} request_list : JSON string array returned by friendExists()'s callback.
 * @param {string} _friend_username : Destination username to add friend request to.
 * @author: Cameron Barb
**/
function addToFriendRequestList(friend_json) {
  // Verify user is logged in
  let loggedInUser = veryifyLoggedInUser();

  let keyval = new Keyval(KEYVAL_API_KEY);

  keyval.set("user-" + friend_id, JSON.stringify(friend_json), function (result) {
    alert("Sent a friend request!");
  },
    (error) => { console.log("Error: " + error) });
}

///////// Accepting and rejecting friend functionality

/**
 * @description:
 * Removes friend from friend request list, returns it to keyval as json, and refreshes the page 
 * in order to update the list display.
 * @param {string} _friend_name : Username to remove from friend list
 * @author: Cameron Barb
**/
function rejectFriend(_friend_name) {
  // Get current user
  let loggedInUser = veryifyLoggedInUser();

  // Create keyval object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Find friend ID using friend name
  friend_id = _friend_name;

  // Get user data from Keyval
  keyval.get("user-" + loggedInUser, rejectFriendUpdate);
}

/**
 * @description:
 * Called by rejectFriend() to update the user's friend request list.
 * 
 * Parses the result, splices the ID from it, and returns it to the server.
 * 
 * @param {string} result - The stringified JSON results from the server,
 * must be parsed to JSON.
 * 
 * @author: Cameron Barb
 */
function rejectFriendUpdate(result) {
  // Get logged in user
  let loggedInUser = veryifyLoggedInUser();

  // Create Keyval object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Parse result into JSON
  let jsonResult = JSON.parse(result);

  // Get friend request list from JSON
  friend_request_list = jsonResult.user_info[0].friend_requests;

  // Get index of friend request and remove
  let index = friend_request_list.indexOf(friend_id);
  friend_request_list.splice(index, 1);

  // Reupdate JSON
  jsonResult.user_info[0].friend_requests = friend_request_list;

  keyval.set("user-" + loggedInUser, JSON.stringify(jsonResult), function (response) {
    alert("Rejected friend request!");
    updateFriendRequests();
  });

}

/**
 * @description: 
 * Starting function for the friend accepting callback chain.
 * 
 * Updates the accepters friend list, by appending the _friend_name
 * to the already obtained friend list.
 * 
 * Then, PUTs the friend list json back onto keyval.
 * 
 * Updates the senders friend list by first obtaining the destination user's
 * friend list json, then appends the current logged in user to it, and sends it back.
 * 
 * If the destination user does not yet have a friends list, noSenderList is called
 * and gives them one, then calls updateSenderList to append this user.
 * 
 * Finally, removes the friend request from the pending friend request list.
 * @param {string} _friend_name : Destination username to add as friend, passed by the accept button
 * @author: Cameron Barb
**/
function acceptFriend(_friend_name) {

  // Create Keyval Object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Get the user list and call a function to run setters
  keyval.get("user_list", function (result) {
    acceptFriendUpdate(result, _friend_name);
  })
}

/**
 * @description: 
 * Called upon successfully getting userlist in acceptFriend().
 * 
 * Attempts to find the friend on the user_list. 
 * 
 * If successful, calls acceptFriendUpdateAccepter() to update 
 * the friend list and friend request list of the accepter. Also calls
 * acceptFriendUpdateSender() to update the friend list of the
 * friend request sender.
 * @param {string} result - The stringified user_list, must be parsed as JSON
 * @param {string} _friend_name - The friend to accept
 * @author: Cameron Barb
 */
function acceptFriendUpdate(result, _friend_name) {

  // Get logged in user
  let loggedInUser = veryifyLoggedInUser();

  // Parse result to get JSON
  let jsonResult = JSON.parse(result);

  // Initialize friend ID to -1
  friend_id = -1;

  // Try to find friend ID in user_list
  for (let i = 0; i < jsonResult.users.length; i++) {
    if (jsonResult.users[i].username == _friend_name) {
      // If successful set friend ID and break
      friend_id = jsonResult.users[i].id;
      break;
    }
  }

  // Verify that we found a valid friend ID
  if (friend_id != -1) {


    // Verify that friend request is not somehow from the current user
    if (friend_id == loggedInUser) {
      // Get the loggedinusers friend request list and remove the invalid friend request
      keyval.get("user-" + loggedInUser, removeStaleFriendRequest);
      // Return
      return
    }

    // Check that friend ID is not already on friend_list
    for (let i = 0; i < friend_list.length; i++) {
      // If found the friend on friend list
      if (friend_list[i] == friend_id) {
        // Get the loggedinusers friend request list and remove the invalid friend request
        keyval.get("user-" + loggedInUser, removeStaleFriendRequest);
        // Return
        return
      }
    }

    // Get accepter's user info
    keyval.get("user-" + loggedInUser, acceptFriendUpdateAccepter);
  }
  // In case of not finding friend ID on user_list
  else {
    alert("Error, see log. Error #1");
    console.log("Error # 1: Friend ID not found. See 'acceptFriendUpdate' function.");
  }

}

///////// Helpers for accepting and rejecting friend functionality

/**
 * @description:
 * A function to remove a friend request if the friend is already on the
 * users friend list. 
 * 
 * This shouldn't be possible since the other user shouldn't be able to 
 * send friend requests to already added friends, so this is used as a failsafe.
 * 
 * @param {string} result - The stringified JSON returned by the server,
 * must be parsed to get JSON 
 * 
 * @author: Cameron Barb
 */
function removeStaleFriendRequest(result) {

  let logged_in_user = veryifyLoggedInUser();
  // Parse result into JSON
  let jsonResult = JSON.parse(result);

  // Get friend request list
  friend_request_list = jsonResult.user_info[0].friend_requests;

  // Splice out friend
  let index = friend_request_list.indexOf(friend_id);
  friend_request_list.splice(index, 1);

  // Update JSON with relevant info
  jsonResult.user_info[0].friend_requests = friend_request_list;

  // Send JSON back to server and alert if successful.
  keyval.set("user-" + logged_in_user, JSON.stringify(jsonResult), function (result) {
    alert("Friend request should not exist! Removing.");
    updateFriendRequests();
  });

}

/**
 * @description:
 * A function called by acceptFriendUpdate() to get the accepter's user info.
 * 
 * Splices the friend request list to remove the accepted request, and adds
 * the friend to the friend request list. Returns stringified JSON to server
 * and alerts if successful 
 * 
 * @param {string} result - The stringified JSON result from server, 
 * must be parsed as JSON
 * 
 * @author: Cameron Barb
 */
function acceptFriendUpdateAccepter(result) {

  // Get logged in user
  let logged_in_user = veryifyLoggedInUser();

  // Parse result to get JSON
  let jsonResult = JSON.parse(result);

  // Create Keyval object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Splice accepters friend request list
  friend_request_list = jsonResult.user_info[0].friend_requests;
  let index = friend_request_list.indexOf(friend_id);
  friend_request_list.splice(index, 1);

  // Update accepters friend list
  friend_list = jsonResult.user_info[0].friends
  friend_list.push(friend_id);

  // Update JSON with relevant info
  jsonResult.user_info[0].friend_requests = friend_request_list;
  jsonResult.user_info[0].friends = friend_list;

  // Send JSON back to server and alert if successful.
  keyval.set("user-" + logged_in_user, JSON.stringify(jsonResult), function (result) {
    // Get senders user info
    keyval.get("user-" + friend_id, acceptFriendUpdateSender);
  });

}

/**
 * @description:
 * A function called by acceptFriendUpdate() to get the senders user info.
 * 
 * Gets the senders friend list, adds the logged in user, and sends it
 * back to the server. Alerts if successful.
 * 
 * @param {string} result - Stringified JSON returned by server, 
 * must be parsed as JSON
 * 
 * @author: Cameron Barb
 */
function acceptFriendUpdateSender(result) {

  // Get logged in user
  let logged_in_user = veryifyLoggedInUser();

  // Create Keyval Object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Parse result to get JSON
  jsonResult = JSON.parse(result);

  // Append logged in user to friend's friend list
  jsonResult.user_info[0].friends.push(logged_in_user);

  // Send the stringified JSON back to the server
  keyval.set("user-" + friend_id, JSON.stringify(jsonResult), function (result) {
    alert("Added friend!");
    updateFriendList();
    updateFriendRequests();
  })
}

///////// Removing friends functionality

/**
 * @description:
 * Called when removeFriend button is clicked.
 * 
 * Removes the particular friend from the user's friend list, and removes
 * the user from the friend's friend list.
 * 
 * @param {string} _friend_id - Friend ID to remove from friend list
 * 
 * @author: Cameron Barb
 */
function removeFriend(_friend_id) {
  // Get logged in user
  let logged_in_user = veryifyLoggedInUser();

  // Create Keyval Object
  let keyval = new Keyval(KEYVAL_API_KEY);
  friend_to_remove_id = _friend_id;

  // Get user data and call removeFriendUpdate()
  keyval.get("user-" + logged_in_user, removeFriendUpdateRemover);

  closeDropdownMenus();
}

/**
 * @description:
 * Called by removeFriend() in order to update the user's friend list.
 * 
 * Splices the friend from the user's friend list JSON and sends it
 * back to the server.
 * 
 * Then calls removeFriendUpdateFriend() to remove the user from their
 * prior friend's friend list.
 * 
 * @param {string} result - Stringified JSON user_info from the server,
 * must be parsed into JSON.
 * 
 * @author: Cameron Barb
 */
function removeFriendUpdateRemover(result) {
  // Get logged in user
  let logged_in_user = veryifyLoggedInUser();

  // Create Keyval Object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Parse result to JSON
  let jsonResult = JSON.parse(result);

  // Get friend list from result
  friend_list = jsonResult.user_info[0].friends;

  // Splice friend from list
  let index = friend_list.indexOf(friend_to_remove_id);
  friend_list.splice(index, 1);

  // Update JSON
  jsonResult.user_info[0].friends = friend_list;

  keyval.set("user-" + logged_in_user, JSON.stringify(jsonResult), function (result) {
    keyval.get("user-" + friend_to_remove_id, removeFriendUpdateFriend);
  });
}

/**
 * @description:
 * Called by removeFriendUpdateRemover() to update the friend's friend list to
 * reflect that the two are no longer friends.
 * 
 * Parses the JSON user_info, splices the user from it, and returns it to the server.
 * 
 * @param {string} result - The stringified JSON user_info of the friend thats
 * being unfriended.
 */
function removeFriendUpdateFriend(result) {
  // Get logged in user
  let logged_in_user = veryifyLoggedInUser();

  // Create Keyval Object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Parse result to JSON
  let jsonResult = JSON.parse(result);

  // Get friend list from result
  let friends_friend_list = jsonResult.user_info[0].friends;

  // Splice friend from list
  let index = friends_friend_list.indexOf(logged_in_user);
  friends_friend_list.splice(index, 1);

  // Update JSON
  jsonResult.user_info[0].friends = friends_friend_list;

  keyval.set("user-" + friend_to_remove_id, JSON.stringify(jsonResult), function (result) {
    alert("Removed friend!");
    updateFriendList();
  });
}

///////// Friend Request Generation

/**
 * @description:
 * Called once the friend request list is successfully retrieved.
 * 
 * Creates friend request elements and adds them to the correct location.
 * @author: Cameron Barb
**/
function friendRequestList() {
  // Create keyval object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Get user list for getting usernames
  keyval.get("user_list", function (result) {
    createFriendRequestList(result);
  });
}

/**
 * @description:
 * Called by friendRequestList() and passed the user_list.
 * 
 * Gets the names of ID's on the friendrequestlist and repeatedly
 * calls createFriendRequestElement to create friend requests.
 * 
 * @param {string} result - Stringified JSON user_list to use
 * to find friend usernames by ID.
 * 
 * @author: Cameron Barb
 */
function createFriendRequestList(result) {
  // Parse result to JSON
  jsonResult = JSON.parse(result);

  // Get friend request list html in order to clear it.
  let old_friend_request_list = document.getElementById("friend-request-list");

  // Iterate through and clear all children.
  while (old_friend_request_list.firstChild) {
    console.log("Removing old friend");
    old_friend_request_list.removeChild(old_friend_request_list.firstChild);
  }

  // If no friend requests in list, display placeholder
  if (friend_request_list.length == 0) {
    let parent = document.getElementById("friend-request-list");
    let noRequests = new TextElement("No friend requests.", "h3", parent, [])
    noRequests.setAttribute("style", "margin:auto; padding-top:10px; padding-bottom:20px;");
  }

  // Clear friend request name list
  friend_request_name_list = [];

  // Get friend request name list
  for (let i = 0; i < friend_request_list.length; i++) {
    for (let j = 0; j < jsonResult.users.length; j++) {
      if (jsonResult.users[j].id == friend_request_list[i]) {
        friend_request_name_list.push(jsonResult.users[j].username);
      }
    }
  }

  // Get friend request list and append request elements to it.
  const friend_request_container = document.getElementById("friend-request-list");
  for (let i = 0; i < friend_request_name_list.length; i++) {
    friend_request_container.appendChild(createFriendRequestElement(friend_request_name_list[i], friend_request_list[i]));
  }

}



/**
 * @description:
 * Creates a friend request element and and returns it.
 * 
 * @param {string} _friend_name - Friend name string
 * @param {string} _friend_id - Friend ID
 * 
 * @returns: Formatted friend request element
 * 
 * @author: Cameron Barb
 */
function createFriendRequestElement(_friend_name, _friend_id) {

  const friend_request_div = document.createElement('div');
  friend_request_div.className = 'friend-request-container'; // Add the container class

  const friend_request_username = document.createElement('div');
  friend_request_username.textContent = _friend_name;
  friend_request_username.className = 'friend_request_username';
  friend_request_div.appendChild(friend_request_username);

  // Declare the friend_profile_picture variable in the current scope
  let friend_profile_picture;
  friend_profile_picture = document.createElement('img');
  friend_profile_picture.alt = 'Friend Profile Picture';
  friend_profile_picture.className = 'friend-profile-picture'; // Add the profile picture class

  const friend_profile_picture_container = document.createElement('div');
  friend_profile_picture_container.className = 'friend-profile-picture-container';
  friend_profile_picture_container.appendChild(friend_profile_picture);


  friend_request_div.appendChild(friend_profile_picture_container);

  // Create Keyval Object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Use keyval to retrieve friends profile picture
  keyval.get("user-" + _friend_id, function (result) {
    // Parse friends data to JSON
    let jsonResult = JSON.parse(result);

    // Get profile picture
    let picture = jsonResult.user_info[0].profile_pic;

    // Set the profile picture to picture if exists, otherwise set to placeholder
    if (picture) {
      friend_profile_picture.src = picture;
    } else {
      // Set a placeholder image if the profile picture is not available
      friend_profile_picture.src = 'assets/default_profile_picture.jpg';
    }
  });

  // Create a container for the buttons
  const friend_buttons_container = document.createElement('div');
  friend_buttons_container.className = 'friend-request-buttons';

  // Generate the accept button
  const acceptButton = document.createElement('button');
  acceptButton.innerText = 'Accept';
  acceptButton.onclick = function () { acceptFriend(_friend_name) };
  acceptButton.className = "friend-request-button";

  // Append the accept button to the friend_buttons_container
  friend_buttons_container.appendChild(acceptButton);

  // Generate the reject button
  const rejectButton = document.createElement('button');
  rejectButton.innerText = 'Reject';
  rejectButton.onclick = function () { rejectFriend(_friend_name) };
  rejectButton.className = "friend-request-button";

  // Append the reject button to the friend_buttons_container
  friend_buttons_container.appendChild(rejectButton);

  // Append the friend button container to the friend request div
  friend_request_div.appendChild(friend_buttons_container);

  // Return the friend request div
  return friend_request_div;
}

//////// Friend List Generation

/**
 * @description:
 * A function called by updateFriendList() once the friend list
 * is set. Gets the user_list in order to find usernames for each
 * respective ID on the userlist. Passes the user_list to createFriendList()
 * 
 * @author: Cameron Barb
 */
function friendList() {
  // Create keyval object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Get user list for getting usernames
  keyval.get("user_list", function (result) {
    createFriendList(result);
  })
}

/**
 * @description:
 * A function called by friendList() to generate a list of friend elements.
 * 
 * First updates the usernamelist using the ID's from the friend list, then
 * generates the elements by iterating through the list of usernames.
 * 
 * @param {string} result - The stringified JSON user_list from the server.
 * Must be parsed as JSON. 
 * 
 * @author: Cameron Barb
 */
function createFriendList(result) {
  // Parse result to JSON
  jsonResult = JSON.parse(result);

  // Get friend request list html in order to clear it.
  let old_friend_list = document.getElementById("friends-list");

  // Iterate through and clear all children.
  while (old_friend_list.firstChild) {
    console.log("Removing old friend");
    old_friend_list.removeChild(old_friend_list.firstChild);
  }

  // If friend list has no elements, display placeholder
  if (friend_list.length == 0) {
    let parent = document.getElementById("friends-list");
    let noRequests = new TextElement("No friends.", "h3", parent, []);
    noRequests.setAttribute("style", "margin:auto; padding-top:10px; padding-bottom:20px;");
  }

  // Clear friend name list
  friend_name_list = [];
  
  // Get friend name list
  for (let i = 0; i < friend_list.length; i++) {
    for (let j = 0; j < jsonResult.users.length; j++) {
      if (jsonResult.users[j].id == friend_list[i]) {
        friend_name_list.push(jsonResult.users[j].username);
      }
    }
  }

  // Iterate through friends and create friend elements
  const friend_container = document.getElementById("friends-list");
  for (let i = 0; i < friend_name_list.length; i++) {
    friend_container.appendChild(createFriendElement(friend_name_list[i], friend_list[i]));
  }

}

/**
 * @description:
 * Creates an individual friend element using the friends name
 * and their ID in order to get their profile picture.
 * 
 * Returns the formatted friend element
 * 
 * @param {string} _friend_name: The name to use as the friends username
 * @param {string} _friend_id: The ID to lookup the profile picture
 * @returns: The completed friend element
 * 
 * @author: Cameron Barb
 */
function createFriendElement(_friend_name, _friend_id) {
  const loggedInUser = localStorage.getItem('logged_in_user');

  const friend_div = document.createElement('div');
  friend_div.className = 'friend-request-container'; // Add the container class

  const friend_username = document.createElement('div');
  friend_username.textContent = _friend_name;
  friend_username.className = 'friend_request_username';
  friend_div.appendChild(friend_username);

  // Declare the friend_profile_picture variable in the current scope
  let friend_profile_picture;
  friend_profile_picture = document.createElement('img');
  friend_profile_picture.alt = 'Friend Profile Picture';
  friend_profile_picture.className = 'friend-profile-picture'; // Add the profile picture class

  const friend_profile_picture_container = document.createElement('div');
  friend_profile_picture_container.className = 'friend-profile-picture-container';
  friend_profile_picture_container.appendChild(friend_profile_picture);

  friend_div.appendChild(friend_profile_picture_container);

  // Create Keyval Object
  let keyval = new Keyval(KEYVAL_API_KEY);

  // Use keyval to retrieve friends profile picture
  keyval.get("user-" + _friend_id, function (result) {
    // Parse friends data to JSON
    let jsonResult = JSON.parse(result);

    // Get profile picture
    let picture = jsonResult.user_info[0].profile_pic;

    // Set the profile picture to picture if exists, otherwise set to placeholder
    if (picture) {
      friend_profile_picture.src = picture;
    } else {
      // Set a placeholder image if the profile picture is not available
      friend_profile_picture.src = 'assets/default_profile_picture.jpg';
    }
  });

  friend_profile_picture.className = 'friend-profile-picture friend-profile-picture-hover';

  friend_profile_picture.addEventListener('click', function(event) {
    event.stopPropagation(); // Prevent the click event from reaching the friend_div

    // Create or toggle the dropdown menu
    toggleDropdownMenu(friend_div, _friend_id);
  });

  // Add a click event listener to the document body to close the dropdown when clicking outside of it
  document.body.addEventListener('click', function() {
    closeDropdownMenus();
  });

  return friend_div;
}

// Function to toggle the dropdown menu
function toggleDropdownMenu(friendDiv, friendId) {
  const existingDropdownMenu = friendDiv.querySelector('.dropdown-menu');
  
  if (existingDropdownMenu) {
    // If the dropdown menu exists, remove it
    existingDropdownMenu.remove();
  } else {
    // If the dropdown menu doesn't exist, create and append it
    const dropdownMenu = createDropdownMenu(friendId);
    friendDiv.appendChild(dropdownMenu);
  }
}

// Function to create the dropdown menu
function createDropdownMenu(friendId) {
  const dropdownMenu = document.createElement('div');
  dropdownMenu.className = 'dropdown-menu';

  // Option to remove friend
  const removeFriendOption = document.createElement('div');
  removeFriendOption.textContent = 'Remove Friend';
  removeFriendOption.addEventListener('click', function() {
    // Call a function to remove the friend
    removeFriend(friendId);
  });
  dropdownMenu.appendChild(removeFriendOption);

  // Option to redirect to friend's profile
  const redirectToProfileOption = document.createElement('div');
  redirectToProfileOption.textContent = 'Redirect to Profile';
  redirectToProfileOption.addEventListener('click', function() {
    navigateToFriendProfile(friendId);
  });
  dropdownMenu.appendChild(redirectToProfileOption);

  return dropdownMenu;
}

// Function to close all dropdown menus
function closeDropdownMenus() {
  const allDropdownMenus = document.querySelectorAll('.dropdown-menu');
  allDropdownMenus.forEach(menu => menu.remove());
}


function navigateToFriendProfile(friendId) {
  console.log('Navigate to friend profile with ID:', friendId);
  window.location.href = 'friend_profile_page.html?id=' + friendId; // Example URL
}

//////////////////////// END FRIEND SYSTEMS ////////////////////////////////////

// Call updateProfileUI on page load
document.addEventListener('DOMContentLoaded', updateProfileUI);

/**
 * load watchlist from keyval onto profile page
 * @author Luke Davis
 */
function loadWatchlistMovies() {
  keyval = new Keyval(KEYVAL_API_KEY);

  // find who is logged in
  let loggedInUserID = localStorage.getItem('logged_in_user');

  // get parent for where everything should go
  let parent = document.getElementById("watched-movies");

  keyval.get("user-" + loggedInUserID,
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
      } else {
        let no_movies = new TextElement("No movies on your watched list.", "h3", parent, []);
        let browse_movies = new Button("Browse movies", parent, [], {},
          function () {
            window.location.href = "index.html";
          }
        );

        browse_movies.setAttribute("class", "browse-more-button");
        return;
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
      let browse_movies = new Button("Browse movies.", parent, [], {},
        function () {
          window.location.href = "index.html";
        }
      );
      return;
    }
  );
}

/**
 * load bookmarked movies onto profile page
 * @author Luke Davis
 */
function loadBookmarkedMovies() {
  keyval = new Keyval(KEYVAL_API_KEY);

  // find who is logged in
  let loggedInUserID = localStorage.getItem('logged_in_user');

  // get parent for where everything should go
  let parent = document.getElementById("bookmarked-movies");

  keyval.get("user-" + loggedInUserID,
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
      } else {
        let no_movies = new TextElement("No movies on your watch later list.", "h3", parent, []);
        let browse_movies = new Button("Browse movies", parent, [], {},
          function () {
            window.location.href = "index.html";
          }
        );

        browse_movies.setAttribute("class", "browse-more-button");
        return;
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
      let browse_movies = new Button("Browse movies.", parent, [], {},
        function () {
          window.location.href = "index.html";
        }
      );
      return;
    }
  );
}

function loadFavoriteMovies() {
  keyval = new Keyval(KEYVAL_API_KEY);

  // find who is logged in
  let loggedInUserID = localStorage.getItem('logged_in_user');

  // get parent for where everything should go
  let parent = document.getElementById("favorite-movies");

  keyval.get("user-" + loggedInUserID,
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
      } else {
        let no_movies = new TextElement("No favorite movies.", "h3", parent, []);
        let browse_movies = new Button("Browse movies", parent, [], {},
          function () {
            window.location.href = "index.html";
          }
        );
        browse_movies.setAttribute("class", "browse-more-button");
        return;
      }

      // loop through movies and load
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

function loadFavoriteGenres() {
  keyval = new Keyval(KEYVAL_API_KEY);
  const loggedInUserID = localStorage.getItem('logged_in_user');

  if (loggedInUserID) {
    keyval.get("user-" + loggedInUserID,
      function (result) {
        console.log("Result from keyval:", result); // Log the result for debugging
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
}


function updateFavoriteGenres() {
  keyval = new Keyval(KEYVAL_API_KEY);

  const selectedGenre = document.getElementById("favorite-genres-dropdown").value;
  const loggedInUserID = localStorage.getItem('logged_in_user');

  if (loggedInUserID) {
    keyval.get("user-" + loggedInUserID,
      function (result) {
        keyval = new Keyval(KEYVAL_API_KEY);
        let jsonResults = JSON.parse(result);

        // Update the array of favorite genres
        let favoriteGenres = jsonResults.user_info[0].favorite_genres || [];

        // Check if the selected genre is already in the array
        const genreIndex = favoriteGenres.indexOf(selectedGenre);
        if (genreIndex !== -1) {
          // If the genre exists, remove it
          favoriteGenres.splice(genreIndex, 1);
        } else {
          // If the genre doesn't exist, add it
          favoriteGenres.push(selectedGenre);
        }

        let newJSON = changeUserJSON(
          jsonResults.user_info[0].id,
          jsonResults.user_info[0].username,
          jsonResults.user_info[0].password,
          jsonResults.user_info[0].bio,
          jsonResults.user_info[0].favorite_movies,
          favoriteGenres,
          jsonResults.user_info[0].favorite_people,
          jsonResults.user_info[0].bookmarked_movies,
          jsonResults.user_info[0].watchlist,
          jsonResults.user_info[0].friends,
          jsonResults.user_info[0].friend_requests,
          jsonResults.user_info[0].profile_pic
        );

        keyval.set("user-" + loggedInUserID, newJSON,
          function () {
            // window.location.reload();
            loadFavoriteGenres();
            console.log('Favorite genres updated.');
            document.getElementById("favorite-genres-dropdown").value = "";
          },
          function () {
            // window.location.reload();
            loadFavoriteGenres();
            console.log("Error when setting favorite genres.");
            document.getElementById("favorite-genres-dropdown").value = "";
          });
      },
      function () {
        console.log("Error retrieving previously stored info from keyval.");
      }
    );
  }
}

/**
 * Load favorite people onto the profile page.
 */
function loadFavoritePeople() {
  keyval = new Keyval(KEYVAL_API_KEY);

  let loggedInUserID = localStorage.getItem('logged_in_user');
  let parent = document.getElementById("favorite-people-container");

  keyval.get("user-" + loggedInUserID,
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
      } else {
        let no_person = new TextElement("No favorite people.", "h3", parent, []);
        let browse_people = new Button("Browse people", parent, [], {},
          function () {
            window.location.href = "index.html?list=people";
          }
        );

        browse_people.setAttribute("class", "browse-more-button");
      }
    },
    function () {
      console.log("An error occurred when retrieving people from keyval.");
      let no_person = new TextElement("No favorite people.", "h3", parent, []);
      let browse_people = new Button("Browse people", parent, [], {},
        function () {
          window.location.href = "index.html?list=people";
        }
      );

      browse_people.setAttribute("class", "browse-more-button");
    }
  );
}


//////Event Listeners
document.getElementById('friend_request_input').addEventListener('focus', function () {
  this.setAttribute('input-placeholder', this.placeholder);
  this.placeholder = '';
});

document.getElementById('friend_request_input').addEventListener('blur', function () {
  this.placeholder = this.getAttribute('input-placeholder');
});