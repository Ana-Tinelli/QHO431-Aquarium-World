const searchInput = document.getElementById("site-search");
const searchStatus = document.getElementById("search-status");
const searchResults = document.getElementById("search-results");

let debounceTimer;

function clearSearchResults() {
  searchResults.replaceChildren();
}

function showStatus(message) {
  searchStatus.textContent = message;
}

function createSearchResult(result) {
  const article = document.createElement("article");
  article.classList.add("search-result");

  const link = document.createElement("a");
  link.classList.add("search-result__link");
  link.href = result.url;

  const type = document.createElement("span");
  type.classList.add("search-result__type");
  type.textContent = result.type;

  const title = document.createElement("h3");
  title.classList.add("search-result__title");
  title.textContent = result.name;

  const description = document.createElement("p");
  description.classList.add("search-result__description");
  description.textContent = result.description;

  link.append(type, title, description);
  article.append(link);

  return article;
}

function displayResults(results) {
  clearSearchResults();

  if (results.length === 0) {
    showStatus("No results found.");
    return;
  }

  showStatus(
    `${results.length} result${results.length === 1 ? "" : "s"} found.`
  );

  results.forEach((result) => {
    searchResults.append(createSearchResult(result));
  });
}

async function searchAquarium(query) {
  showStatus("Searching...");
  clearSearchResults();

  try {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Search request failed.");
    }

    const results = await response.json();

    if (searchInput.value.trim() !== query) {
      return;
    }

    displayResults(results);
  } catch (error) {
    console.error("Search request error:", error);
    clearSearchResults();
    showStatus(
      "Sorry, search results could not be loaded. Please try again."
    );
  }
}

if (searchInput && searchStatus && searchResults) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();

    clearTimeout(debounceTimer);

    if (!query) {
      clearSearchResults();
      showStatus("");
      return;
    }

    debounceTimer = setTimeout(() => {
      searchAquarium(query);
    }, 300);
  });
}