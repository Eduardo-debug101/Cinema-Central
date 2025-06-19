function searchMovies() {
  // Retrieve the search query from localStorage
  searchQuery = localStorage.getItem('searchQuery');
  console.log(searchQuery);

  // Construct the search URL with the retrieved searchQuery
  //const searchURL = constructURL("search/movie", "1", `query=${searchQuery}`);
  //console.log(searchURL);

  searchMoviesDeck = new SearchDeck("search/movie", document.getElementById("searchResults"), searchQuery);
}

/**
 * Redirect to the search results page when the search button is pressed.
 */
function redirectToSearchPage() {
  // Get the search query from the input field
  searchQuery = document.getElementById("searchInput").value;
  console.log(searchQuery);

  // Check if a search query is provided
  if (!searchQuery) {
    // If there's no search query, display a message to the user
    alert("There are no movies that matched your query.");
  } else {
    // Save the searchQuery to localStorage for later use
    localStorage.setItem('searchQuery', searchQuery);

    // Construct the search URL and navigate to the search results page
    const searchURL = `search.html?query=${searchQuery}`;
    window.location.href = searchURL;
  }
}