class SiteNavBar extends NavigationBar {
    itemLayout = {
        logo: {
            itemType: "link",
            effect: "index.html",
            contentType: "image",
            content: "assets/CC_logo.png",
        },
        movies: {
            itemType: "link",
            effect: "index.html",
            contentType: "text",
            content: "Movies",
        },
        people: {
            itemType: "link",
            effect: "index.html?list=people",
            contentType: "text",
            content: "People",
        },
        messages: {
            itemType: "link",
            effect: "message_page.html?title=General&id=1",
            contentType: "text",
            content: "Discussion",
        },
        filler: {
            itemType: "filler",
            contentType: "none",
        },
        login: {
            itemType: "link",
            effect: "login.html",
            contentType: "text",
            content: "Login",
        },
        register: {
            itemType: "link",
            effect: "sign_up_page.html",
            contentType: "text",
            content: "Sign Up",
        },
        username: {
            itemType: "plain",
            contentType: "text",
            content: ""
        },
        logOut: {
            itemType: "button",
            effect: () => {
                logoutUser();
                this.loggedOutLayout();
            },
            contentType: "text",
            content: "Log Out",
        },
        profilePicture: {
            itemType: "link",
            effect: "profile_page.html",
            contentType: "image",
            content: "assets/default_person.png",
            itemAttributes: {
                class: "profile-picture"
            }
        }
    }

    constructor(parent) {
        super(parent);
        this.addClass("nav-bar default");
        this.addItems(this.itemLayout);

        let pageId = this.getPageId();
        this.setActiveItem(pageId);

        if (this.isLoggedIn()) {
            this.loggedInLayout();
        } else {
            this.loggedOutLayout();
        }
    }

    loggedInLayout() {
        this.showHiddenItems();
        this.hideItem("login");
        this.hideItem("register");
        this.setContent("username", "text", "Welcome " + this.getUsername())
        this.setProfilePicture();
    }

    loggedOutLayout() {
        this.showHiddenItems();
        this.hideItem("profilePicture");
        this.hideItem("logOut");
        this.hideItem("username");
    }

    getUsername() {
        let keyval = new Keyval();

        keyval.get("user-" + getItem('logged_in_user'),
            function (results) {
                let jsonResults = JSON.parse(results);

                localStorage.setItem('logged_in_username', jsonResults.user_info[0].username);
            },
            function () {
                console.log("Error when retrieving username in NavBar.");
            }
        );

        return localStorage.getItem('logged_in_username');
    }

    getID() {
        return getItem('logged_in_user');
    }

    setProfilePicture() {
        let keyval = new Keyval();

        keyval.get("user-" + getItem('logged_in_user'),
            (results) => {
                let jsonResults = JSON.parse(results);
                this.setContent("profilePicture", "image", jsonResults.user_info[0].profile_pic);
            },
            function () {
                console.log("Error when retrieving prfile picture in NavBar.");
            }
        );
    }

    isLoggedIn() {
        return this.getID();
    }

    getPageId() {
        let params = (new URL(document.location)).searchParams;
        let queryActivePage = params.get("list");
        let header = document.querySelector(".header");
        let activePage = queryActivePage ? queryActivePage : header.getAttribute("data-page-name");
        return activePage;
    }
}

window.addEventListener("load", () => {
    let header = document.querySelector(".header");
    let nav = new SiteNavBar(header);
})