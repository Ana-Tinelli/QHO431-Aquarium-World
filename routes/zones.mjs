import express from "express";
import { all, get } from "../database/db.mjs";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const zones = await all(`
      SELECT
        zone_id,
        name,
        slug,
        short_description,
        image_path
      FROM zones
      ORDER BY zone_id
    `);

    res.render("zones", { zones });
  } catch (error) {
    console.error("Error loading zones:", error.message);
    res.status(500).send("Unable to load zones.");
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const zone = await get(
      `
        SELECT
          zone_id,
          name,
          slug,
          short_description,
          description,
          image_path,
          conservation_message
        FROM zones
        WHERE slug = ?
      `,
      [req.params.slug]
    );

    if (!zone) {
      return res.status(404).render("404");
    }

    const exhibits = await all(
      `
        SELECT
          exhibit_id,
          name,
          description,
          exhibit_type,
          image_path,
          display_order
        FROM exhibits
        WHERE zone_id = ?
        ORDER BY display_order
      `,
      [zone.zone_id]
    );

    res.render("zone", { zone, exhibits });
  } catch (error) {
    console.error("Error loading zone:", error.message);
    res.status(500).send("Unable to load this zone.");
  }
});

export default router;