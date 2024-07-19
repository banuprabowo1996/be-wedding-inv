const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

const pgp = require("pg-promise")(/* options */);

const db = pgp({
  host: "localhost", // Default host
  port: 5432, // Default port
  database: "wedding-invitation", // Your new database name
  user: "banudtn", // The owner of the new database
  password: "postgres", // The password for the owner
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

db.one("SELECT $1 AS value", 123)
  .then((data) => {
    console.log("DATA:", data.value);
  })
  .catch((error) => {
    console.log("ERROR:", error);
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/comments", (req, res) => {
  const { tag } = req.query;
  db.any(`SELECT name, comment, tag FROM wishes WHERE tag='${tag}'`)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error("ERROR:", error);
      res.status(500).send("Error fetching comments.");
    });
});

app.post("/comment", (req, res) => {
  const { name, comment, tag } = req.body;
  const now = new Date();

  // Insert data into the database
  db.none("INSERT INTO wishes(name, comment, tag, created_at) VALUES($1, $2, $3, $4)", [
    name,
    comment,
    tag,
    now,
  ])
    .then(() => {
      res.send("Comment saved successfully!");
    })
    .catch((error) => {
      console.error("ERROR:", error);
      res.status(500).send("Error saving comment.");
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
