import express from "express";
import zonesRouter from "./routes/zones.mjs";
import { all } from "./database/db.mjs";
import contactRouter from "./routes/contact.mjs";
import searchRouter from "./routes/search.mjs";

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use("/zones", zonesRouter);
app.use("/contact", contactRouter);
app.use("/api/search", searchRouter);

const PORT = 5000;

app.get("/", async (req, res) => {
  try {
    const zones = await all(`
      SELECT
        name,
        slug,
        short_description
      FROM zones
      ORDER BY zone_id
    `);

    res.render("home", { zones });
  } catch (error) {
    console.error("Error loading homepage:", error.message);
    res.status(500).send("Unable to load the homepage.");
  }
});

app.get("/activity", (req, res) => {
  res.render("activity");
});

app.get("/events", (req, res) => {
  res.render("events");
});

app.get("/faq", (req, res) => {
  res.render("faq");
});

app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});