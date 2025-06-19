class SearchDeck extends Deck {
    constructor(category, parent, query) {
        //I implemented the deck class so the cards wont break when the css is changed
        super(parent, "default_movie.jpg", "grid");
        this.category = category;
        this.pages = 0;
        this.query = query;
        this.isLoading = false; // Flag to prevent multiple simultaneous requests
        //this.deck = new Element("div", parent, ["card-deck"]);
        this.stutterTimeout = null; // Variable to store the timeout for the stutter effect

        this.relocateSubHeader();
        this.addPage();
        // Add a scroll event listener to the document
        window.addEventListener('wheel', () => {
            // Check if the user has scrolled to the bottom of the page
            if (this.isAtBottom() && !this.isLoading) {
                // Add a delay (stutter) before loading more content
                if (this.stutterTimeout) {
                    clearTimeout(this.stutterTimeout);
                }
                this.stutterTimeout = setTimeout(() => {
                    this.addPage();
                }, 0); // Delay for 250 milliseconds (adjust as needed)
            }
        });
    }

    relocateSubHeader(subheader = document.querySelector(".subheader")) {
        this.addChild(subheader);
    }

    isAtBottom() {
        // Check if the user has scrolled to the bottom of the page
        return (
            window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
        );
    }

    addPage() {
        this.isLoading = true; // Set isLoading to true to prevent multiple requests
        this.pages++;
        this.#getMovieData(this.pages, (movies) => {
            this.#createCards(movies);
            this.isLoading = false; // Reset isLoading after the request is complete
        });
    }

    reload() {
        this.deck.innerHTML = "";
        for (let page = 0; page < this.pages; page++) {
            this.addPage();
        }
    }

    #createCards(movies) {
        for (let movie of movies) {
            this.addCard(
                movie.title,
                `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
                `movie_page.html?id=${movie.id}`,
                this.deck
            );
        }
    }

    async #getMovieData(page, callback) {
        let url = constructURL("search/movie", page, `query=${this.query}`);
        let data = await loadJSON(url, (data) => callback(data.results));
    }

    #createCard(nameOfMovie, image, link, parent) {
        let cardLink = new Element("a", parent, ["card-link card-container scale"], { "href": link });
        let card = new Element("div", cardLink, ["card"]);

        if (image != "https://image.tmdb.org/t/p/w500/null") {
            // Check if the image URL is not empty or null
            let poster = new Element("img", card, undefined, { "src": image });
        } else {
            // Use a custom image as a fallback when there is no poster image
            console.log(nameOfMovie + " " + image);
            let customImageURL = "assets/unknown_poster.png"; // Replace with your custom image URL
            let poster = new Element("img", card, undefined, { "src": customImageURL });
        }

        let titleContainer = new Element("div", card, ["title-container"]);
        let title = new TextElement(nameOfMovie, "div", titleContainer, ["title"]);
    }

}