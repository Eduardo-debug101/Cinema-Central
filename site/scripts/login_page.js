let login_username;
let login_password;

let signup_username;
let signup_password;

let current_user_id;

let user_list;

/**
 * sign up page on load
 * @author Luke Davis
 */
function loadPageParams() {
    // search through url parameters
    var urlSearchParameters = new URLSearchParams(window.location.search);
    var url_username = urlSearchParameters.get('username');
    var url_password = urlSearchParameters.get('password');

    // assign values to sign-up page inputs
    document.getElementById("signupUsernameInput").value = url_username;
    document.getElementById("signupPasswordInput").value = url_password;
    document.getElementById("signupUsernameInput").focus();
}

/**
* Redirects user to login page.
* @author: Cameron Barb
**/
function redirectToLoginPage() {
    window.location.href = "login.html";
}

/**
 * Redirects user to signup page.
 * @author: Cameron Barb
**/
function redirectToSignupPage() {
    window.location.href = "sign_up_page.html";
}

/**
* Callback function, called when trying to login.
* Compares password stored in keyval to login_password,
* which is the password the user entered into the login input.
* @param {string} result - The string stored at password keyval
* @author: Eduardo Argueta-Pineda
**/
function checkPassword(result) {
    // If user_list does not exist, treat as no users
    if (!result) {
        alert("User not found. Please sign up.");
        window.location.href = "sign_up_page.html?username=" + login_username + "&password=" + login_password;
        return;
    }

    let jsonResults = JSON.parse(result);

    for (let i = 0; i < jsonResults.users.length; i++) {
        if (login_username == jsonResults.users[i].username) {
            if (login_password == jsonResults.users[i].password) {
                storeItem('logged_in_user', jsonResults.users[i].id);
                storeItem('logged_in_username', jsonResults.users[i].username)
                window.location.href = "index.html";
                setLoggedInSession(jsonResults.users[i].id);
                return;
            } else {
                alert("Password is incorrect. Please try again.");
                return;
            }
        }
    }

    alert("User not found. Please sign up.");
    window.location.href = "sign_up_page.html?username=" + login_username + "&password=" + login_password;
}

/**
 * Gets inputs from login page input boxes, and checks keyval for
 * validity of username.
 * @author: Cameron Barb
**/
function loginUser(username = document.getElementById("usernameInput").value, password = document.getElementById("passwordInput").value) {
    login_username = username;
    login_password = password;
    keyval = new Keyval();
    if (!login_username || !login_password) {
        alert("Must input a username and password.");
    }
    else {
        keyval.get("user_list", checkPassword, userListError);

        // let keyvalURL = constructKeyvalURL("users-" + login_username + "-password");
        // httpGet(keyvalURL, checkPassword, invalidUsername);
    }
    return false;
}

/**
 * Logs the user out, and reloads the homepage
 * @author Cameron Barb
**/
function logoutUser() {
    storeItem('logged_in_user', "");
    window.location.href = "index.html";
    clearLoggedInSession();
}

/**
 * Attempts to signup a user. Checks for valid, unused username, and signs
 * the user up for an account.
 * @author Cameron Barb
**/
function createUser() {
    signup_username = document.getElementById("signupUsernameInput").value;
    signup_password = document.getElementById("signupPasswordInput").value;

    keyval = new Keyval();
    if (!signup_username || !signup_password) {
        alert("Must input a username and password");
    }
    else {
        keyval.get("user_list", listFound, userListError);

        // let keyvalURL = constructKeyvalURL("users_list");
        // httpGet(keyvalURL, listFound, (err) => {
        //     alert("User list does not exist!");
        // });
    }
    return false;
}

function userListError() {
    keyval = new Keyval();
    alert("You were the first user. User list was created. Please try again");
    keyval.set("user_list", "{\"users\":[]}", function () { }, genericKeyvalError);
}

/**
 * Callback function.
 * 
 * This function is called if createUser() finds that
 * the provided username is valid (doesn't already exist).
 * 
 * Creates a new username key in keyval, and also appends
 * a password key under '-password'.
 * @author: Cameron Barb
**/
function createUserKey(jsonResults) {
    if (!signup_username || !signup_password) {
        alert("Must input a username and password.");
    }
    else {
        keyval = new Keyval();
        console.log(signup_password);
        console.log(concatNewUsersJSON(jsonResults, signup_username, signup_password));
        current_user_id = (jsonResults.users.length + 1);
        keyval.set("user_list", JSON.stringify(concatNewUsersJSON(jsonResults, signup_username, signup_password)),
            function () {
                alert("User created. You will be logged automatically.");
                loginUser(signup_username, signup_password);
                // redirectToLoginPage();
            }, genericKeyvalError);

        // console.log(JSON.stringify(concatNewUser(signup_username, signup_password, current_user_id)));
        keyval.set("user-" + current_user_id, JSON.stringify(concatNewUser(signup_username, signup_password, current_user_id)),
            function () {
                console.log("User keyval created successfully.");
            }, genericKeyvalError);
        // // Create username
        // let keyvalURL = constructKeyvalURL("user-" + jsonResults.users.length + 1);
        // httpDo(keyvalURL, "PUT", "Exists", function(res){}, genericKeyvalError);

        // // Create password
        // keyvalURL = constructKeyvalURL("users-" + signup_username + "-password");
        // httpDo(keyvalURL, "PUT", "text", signup_password, redirectToLoginPage, genericKeyvalError);
    }
}

/**
 * Appends the user signing up to the user listjson string
 * @param {JSON} jsonResults 
 * @param {string} uname 
 * @param {string} pass 
 * @returns JSON - new JSON of user list with added user
 */
function concatNewUsersJSON(jsonResults, uname, pass) {
    // console.log(JSON.stringify(jsonResults));
    let newJSON = "{\"users\":[";

    for (let i = 0; i < jsonResults.users.length; i++) {
        newJSON = newJSON + "{\"username\":\"" + jsonResults.users[i].username;
        newJSON = newJSON + "\", \"password\":\"" + jsonResults.users[i].password;
        newJSON = newJSON + "\", \"id\":\"" + jsonResults.users[i].id + "\"},";
    }

    newJSON = newJSON + "{\"username\":\"" + uname;
    newJSON = newJSON + "\", \"password\":\"" + pass;
    newJSON = newJSON + "\", \"id\":\"" + (jsonResults.users.length + 1) + "\"}";

    newJSON = newJSON + "]}";

    // console.log(newJSON);
    return JSON.parse(newJSON);
}

/**
 * Creates json string for new user
 * @param {string} uname 
 * @param {string} pass 
 * @param {string} id 
 * @returns JSON - new JSON for an idividual user
 */
function concatNewUser(uname, pass, id) {
    let newJSON = ("{\"user_info\":[{\"id\":\"" + id + "\",\"username\":\"" + uname + "\", \"password\":\"" + pass + "\", \"bio\":\"Your bio goes here...\", \"favorite_movies\":[], \"favorite_genres\":[], \"favorite_people\":[], \"bookmarked_movies\":[], \"watchlist\":[], \"friends\":[], \"friend_requests\":[], \"profile_pic\":\"assets/default_person.png\"}]}");

    console.log(JSON.parse(newJSON));
    return JSON.parse(newJSON);
}

/**
 * Generic keyval error that just alerts 
 * that keyval isn't working.
 * @author: Cameron Barb
**/
function genericKeyvalError() {
    console.log("Keyval Error");
}

/**
 * Error callback from loginUser().
 * 
 * Informs user of invalid username.
 * @author: Cameron Barb
**/
function invalidUsername() {
    alert("Username does not exist");
}

/**
 * Error callback from createUser().
 * 
 * Called if createUser() finds that the provided
 * username already exists in keyval.
 * @author Eduardo Argueta-Pineda
**/
function listFound(result) {
    // If user_list does not exist, initialize it
    if (!result) {
        result = JSON.stringify({ users: [] });
    }

    let jsonResults = JSON.parse(result);

    // If no users, create the first user
    if (jsonResults.users.length == 0) {
        console.log("Setting up first user.");
        createUserKey(jsonResults);
        return;
    }

    // Check if username already exists
    for (let i = 0; i < jsonResults.users.length; i++) {
        if (signup_username == jsonResults.users[i].username) {
            alert("User already exists. Please log in.");
            redirectToLoginPage();
            return;
        }
    }

    // If username not found, create new user
    createUserKey(jsonResults);
}