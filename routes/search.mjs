import express from "express";
import { all } from "../database/db.mjs";

const router = express.Router();

router.get("/", async (req, res) => {
  const query = (req.query.q || "").trim();

  if (!query) {
    return res.json([]);
  }

  try {
    const searchTerm = `%${query}%`;

    const results = await all(
      `
        SELECT
          zone_id AS id,
          name,
          'Zone' AS type,
          short_description AS description,
          '/zones/' || slug AS url
        FROM zones
        WHERE name LIKE ?
           OR short_description LIKE ?

        UNION ALL

        SELECT
          exhibits.exhibit_id AS id,
          exhibits.name,
          'Exhibit' AS type,
          exhibits.description,
          '/zones/' || zones.slug || '#exhibit-' || exhibits.exhibit_id AS url
        FROM exhibits
        JOIN zones
          ON exhibits.zone_id = zones.zone_id
        WHERE exhibits.name LIKE ?
           OR exhibits.description LIKE ?

        UNION ALL

        SELECT
          event_id AS id,
          name,
          'Event' AS type,
          short_description AS description,
          '/events' AS url
        FROM events
        WHERE name LIKE ?
           OR short_description LIKE ?

        ORDER BY type, name
      `,
      [
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm
      ]
    );

    res.json(results);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({
      error: "Unable to load search results."
    });
  }
});

export default router;