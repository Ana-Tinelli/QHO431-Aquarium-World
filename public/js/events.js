const eventsForm = document.getElementById("events-filters");
const yearSelect = document.getElementById("event-year");
const categorySelect = document.getElementById("event-category");
const eventsStatus = document.getElementById("events-status");
const eventsResults = document.getElementById("events-results");

function clearEventResults() {
  eventsResults.replaceChildren();
}

function showEventsStatus(message) {
  eventsStatus.textContent = message;
}

function createEventCard(event) {
  const article = document.createElement("article");
  article.classList.add("event-card");

  if (event.imagePath) {
  const image = document.createElement("img");
  image.classList.add("event-card__image");
  image.src = event.imagePath;
  image.alt = "";
  image.loading = "lazy";

  article.append(image);
}

  const content = document.createElement("div");
  content.classList.add("event-card__content");

  const category = document.createElement("p");
  category.classList.add("event-card__category");
  category.textContent = event.categoryName;

  const heading = document.createElement("h3");
  const titleLink = document.createElement("a");
  titleLink.href = `/events/${event.slug}`;
  titleLink.textContent = event.name;
  heading.append(titleLink);

  const date = document.createElement("p");
  date.classList.add("event-card__date");

  const time = document.createElement("time");
  time.dateTime = event.eventDate;
  time.textContent = event.dateLabel;
  date.append(time);

  const description = document.createElement("p");
  description.textContent = event.shortDescription;

  const detailLink = document.createElement("a");
  detailLink.classList.add("card-link");
  detailLink.href = `/events/${event.slug}`;
  detailLink.textContent = "View event details";

  content.append(category, heading, date, description, detailLink);
  article.append(content);

  return article;
}

function displayEvents(events) {
  clearEventResults();

  if (events.length === 0) {
    showEventsStatus("No events found for the selected filters.");
    return;
  }

  showEventsStatus(
    `${events.length} event${events.length === 1 ? "" : "s"} found.`
  );

  events.forEach((event) => {
    eventsResults.append(createEventCard(event));
  });
}

let latestEventsRequest = 0;

async function loadFilteredEvents() {
  const requestId = ++latestEventsRequest;

  const parameters = new URLSearchParams({
    year: yearSelect.value
  });

  if (categorySelect.value) {
    parameters.set("category", categorySelect.value);
  }

  showEventsStatus("Loading events...");
  clearEventResults();

  try {
    const response = await fetch(
      `/api/events?${parameters.toString()}`
    );

    if (!response.ok) {
      throw new Error("Events request failed.");
    }

    const data = await response.json();

    if (requestId !== latestEventsRequest) {
      return;
    }

    displayEvents(data.events);

    window.history.replaceState(
      null,
      "",
      `/events?${parameters.toString()}`
    );
  } catch (error) {
    if (requestId !== latestEventsRequest) {
      return;
    }

    console.error("Events request error:", error);
    clearEventResults();

    showEventsStatus(
      "Sorry, events could not be loaded. Please try again."
    );
  }
}

if (
  eventsForm &&
  yearSelect &&
  categorySelect &&
  eventsStatus &&
  eventsResults
) {
  yearSelect.addEventListener("change", loadFilteredEvents);
  categorySelect.addEventListener("change", loadFilteredEvents);
}