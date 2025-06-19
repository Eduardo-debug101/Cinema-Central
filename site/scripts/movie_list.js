/**
 * Create movie list
 * @extends Deck
 * @author Nischal Lawot
 */
class TMDBList extends Deck {
    /**
     * create a new movie list
     * @param {*} parent - where should the list go
     * @param {dictionary} options - name: category for dropdown
     * @author Nischal Lawot
     */
    constructor(parent, options, defaultImage) {
        super(undefined, defaultImage, "grid")
        this.category = options[Object.keys(options)[0]];
        this.pages = 0;

        this.loadPages = new AsyncLoop(this.#addPage.bind(this), this.#isPageNotFull, 0);

        let dropdownLocation = document.querySelector(".category-selector-container");
        console.log(dropdownLocation)
        this.dropDown = new SimpleDropDown(dropdownLocation, options, (option) => {
            this.setCategory(option.replace(" ", "_").toLowerCase());
        }, ["tmdb-list-input category-selector"]);

        this.relocateSubHeader();
        this.setParent(parent);

        let main = document.querySelector("main");
        main.addEventListener("scroll", () => {
            this.loadPages.start();
        });
        window.addEventListener("resize", () => {
            this.loadPages.start();
        });
        this.loadPages.start();
    }

    relocateSubHeader(subheader = document.querySelector(".subheader")) {
        this.addChild(subheader);
    }

    /**
     * Checks whether page has been filled slightly more that how far the user has scrolled.
     * @returns - true or false depending on whether more content is needed
     */
    #isPageNotFull() {
        let offset = 1.5; // offset to hide loading process
        let main = document.querySelector("main");
        let windowHeight = window.innerHeight;
        let modifiedHeight = windowHeight * offset; // gives a little extra offset for loading more cards
        let bodyHeight = main.scrollHeight;
        let scrollHeight = main.scrollTop;
        //console.log(`${modifiedHeight} + ${scrollHeight} = ${modifiedHeight + scrollHeight} >= ${bodyHeight}`, modifiedHeight + scrollHeight >= bodyHeight)
        return (modifiedHeight + scrollHeight >= bodyHeight);

    }

    /**
     * add new page to the list
     * @author Nischal Lawot
     */
    async #addPage() {
        this.pages++;
        let data = await this.#getData(this.pages);
        this.createCards(data);
    }

    /**
     * set current category
     * @param {string} category - current category to view
     * @author Nischal Lawot
     */
    setCategory(category) {
        this.category = category;
        this.#reload();
    }

    /**
     * reload page
     * @author Nischal Lawot
     */
    #reload() {
        let subheader = document.querySelector(".subheader")
        this.clear();
        this.relocateSubHeader(subheader)
        this.pages = 0;
        this.loadPages.start();
    }

    /**
     * create cards
     * @param {array} list - items to add as cards
     * @author Nischal Lawot
     */
    createCards(list) {
        //abstract class
        throw new Error("createCards method required");
    }

    /**
     * get movie data from API
     * @param {string} page - page number to retrieve
     */
    async #getData(page) {
        const options = { method: 'GET', headers: { accept: 'application/json' } };
        let url = constructURL(this.category, page, null);
        let data = await fetch(url, options)
            .then(response => response.json())
            .then(json => json.results)
        return data;
    }
}

class MovieList extends TMDBList {
    constructor(parent) {
        super(
            parent,
            {
                "Popular": "movie/popular",
                "Now Playing": "movie/now_playing",
                "Top Rated": "movie/top_rated",
                "Upcoming": "movie/Upcoming"
            },
            "default_movie.jpg"
        );
    }
    /**
     * create cards of people
     * @param {array} list - people to add as cards
     * @author Nischal Lawot
     */
    createCards(list) {
        for (let data of list) {
            this.addCard(
                data.title,
                `https://image.tmdb.org/t/p/w500/${data.poster_path}`,
                `movie_page.html?id=${data.id}`,
                this.element
            );
        }
    }
}

class PeopleList extends TMDBList {
    constructor(parent) {
        super(
            parent,
            {
                "Popular": "person/popular"
            },
            "default_person.png"
        );
    }
    /**
     * create cards of people
     * @param {array} list - people to add as cards
     * @author Nischal Lawot
     */
    createCards(list) {
        for (let data of list) {
            this.addCard(
                data.original_name,
                `https://image.tmdb.org/t/p/w500/${data.profile_path}`,
                `people_page.html?id=${data.id}`,
                this.element
            );
        }
    }
}

window.addEventListener("load", () => {
    let main = document.querySelector("#movie-results");
    let params = (new URL(document.location)).searchParams;
    let listType = params.get("list");
    let list;
    if (listType === "people") {
        document.querySelector(".search-box").parentElement.remove();
        list = new PeopleList(main);
    } else {
        list = new MovieList(main);
    }
})