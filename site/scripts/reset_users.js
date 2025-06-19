/**
 * Resets all users currently loaded into database.
 * Functions only run when button on page is pressed.
 */

// keyval to access user information
let keyval;

/**
 * loops through and deletes each individual user
 * @author Luke Davis
 */
function reset_users() {
    keyval = new Keyval();

    // Get user list
    keyval.get("user_list", 
        function (results) {
            let keyval = new Keyval();

            // check if list is already empty
            if (results == "") {
                console.log("INFO: User list is already empty.");
                // skip everything else
                return;
            }

            // parse results as JSON
            let jsonResults = JSON.parse(results);

            // loop through all users
            for(let i = 0; i < jsonResults.users.length; i++) {
                // store username and ID for debugging
                localStorage.setItem("username_reset", jsonResults.users[i].username);
                localStorage.setItem("id_reset", jsonResults.users[i].id);

                // set user information to blank
                keyval.set("user-" + jsonResults.users[i].id, "",
                    function () {
                        // everything was successful
                        console.log("SUCCESS: The user " + localStorage.getItem("username_reset") + " (id: " + localStorage.getItem("id_reset") + ") has been reset.");
                    },
                    function (error) {
                        // something bad happened
                        console.error("FAILURE: The user " + localStorage.getItem("username_reset") + " (id: " + localStorage.getItem("id_reset") + ") failed to reset: " + error);
                        alert("A failure has occured when resetting a user. Please see the console for more information. Fix the errors and reload the page.");
                    }
                );

                // once list is finished
                if (i == jsonResults.users.length - 1) {
                    // reset entire list
                    resetUserList();
                }
            }
        },
        function (error) {
            // couldnt get list of users
            console.error("An error has occurred when getting full user list: " + error);
            alert("A failure has occured when retrieving user list. Please see the console for more information. Fix the errors and reload the page.");
        }
    );
}

/**
 * Reset master list of users. Can only occur after reset_users.
 * @author Luke Davis
 */
function resetUserList() {
    // set user list to empty
    keyval.set("user_list", "", 
        function () {
            // everything went ok
            console.log("SUCCESS: User list has been reset.");
        },
        function () {
            // something happened
            console.error("FAILURE: User list was unable to be reset.");
            alert("A failure has occured when resetting the user list. Please see the console for more information. Fix the errors and reload the page.");
        }
    );

    // alert that everything is fine
    alert("The user list and all users have been reset. You will be redirected to the home page now.");

    // logout any user currently signed in
    localStorage.setItem('logged_in_user', '');
    // go to homepage
    window.location.href = "index.html";
}