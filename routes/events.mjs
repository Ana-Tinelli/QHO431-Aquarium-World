import express from "express";
import { all, get } from "../database/db.mjs";

const router = express.Router();

function getTodayDateString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatEventDate(eventDate) {
  const [year, month, day] = eventDate.split("-").map(Number);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function prepareEvent(event) {
  return {
    ...event,
    dateLabel: formatEventDate(event.eventDate)
  };
}

async function getAvailableYears() {
  return all(`
    SELECT DISTINCT
      strftime('%Y', event_date) AS year
    FROM events
    ORDER BY year DESC
  `);
}

async function getEventCategories() {
  return all(`
    SELECT
      name,
      slug
    FROM event_categories
    ORDER BY name
  `);
}

function getSelectedFilters(query, years, categories) {
  const currentYear = String(new Date().getFullYear());
  const requestedYear = String(query.year || currentYear);
  const requestedCategory = String(query.category || "");

  const yearExists = years.some((item) => item.year === requestedYear);

  const categoryExists = categories.some(
    (item) => item.slug === requestedCategory
  );

  return {
    year: yearExists ? requestedYear : currentYear,
    category: categoryExists ? requestedCategory : ""
  };
}

async function getFilteredEvents(year, category) {
  let sql = `
    SELECT
      events.name,
      events.slug,
      events.short_description AS shortDescription,
      events.event_date AS eventDate,
      events.image_path AS imagePath,
      event_categories.name AS categoryName,
      event_categories.slug AS categorySlug
    FROM events
    JOIN event_categories
      ON events.category_id = event_categories.category_id
    WHERE strftime('%Y', events.event_date) = ?
  `;

  const parameters = [year];

  if (category) {
    sql += `
      AND event_categories.slug = ?
    `;
    parameters.push(category);
  }

  sql += `
    ORDER BY events.event_date ASC
  `;

  const events = await all(sql, parameters);

  return events.map(prepareEvent);
}

router.get("/events", async (req, res) => {
  try {
    const [years, categories] = await Promise.all([
      getAvailableYears(),
      getEventCategories()
    ]);

    const filters = getSelectedFilters(req.query, years, categories);
    const events = await getFilteredEvents(
      filters.year,
      filters.category
    );

    res.render("events", {
      pageTitle: "Events",
      years,
      categories,
      events,
      selectedYear: filters.year,
      selectedCategory: filters.category
    });
  } catch (error) {
    console.error("Error loading events:", error.message);
    res.status(500).send("Unable to load events.");
  }
});

router.get("/api/events", async (req, res) => {
  try {
    const [years, categories] = await Promise.all([
      getAvailableYears(),
      getEventCategories()
    ]);

    const filters = getSelectedFilters(req.query, years, categories);
    const events = await getFilteredEvents(
      filters.year,
      filters.category
    );

    res.json({ events });
  } catch (error) {
    console.error("Events API error:", error.message);
    res.status(500).json({
      error: "Unable to load events."
    });
  }
});

router.get("/events/:slug", async (req, res) => {
  try {
    const event = await get(
      `
        SELECT
          events.name,
          events.slug,
          events.description,
          events.event_date AS eventDate,
          events.image_path AS imagePath,
          event_categories.name AS categoryName
        FROM events
        JOIN event_categories
          ON events.category_id = event_categories.category_id
        WHERE events.slug = ?
      `,
      [req.params.slug]
    );

    if (!event) {
      return res.status(404).render("404", {
  pageTitle: "Page not found"
});
    }

    const isPast = event.eventDate < getTodayDateString();

    res.render("event", {
      pageTitle: event.name,
      event: {
        ...event,
        dateLabel: formatEventDate(event.eventDate)
      },
      isPast
    });
  } catch (error) {
    console.error("Error loading event detail:", error.message);
    res.status(500).send("Unable to load this event.");
  }
});

export default router;