import express from "express";

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));

const PORT = 5000;

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/zones", (req, res) => {
  res.render("zones");
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

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});