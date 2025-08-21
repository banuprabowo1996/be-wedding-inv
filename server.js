require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.DB_URL;

mongoose
  .connect(uri, {
    tls: true, // Enable TLS/SSL
    tlsInsecure: true, // Disable strict validation (not recommended for production)
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  try {
    // Connect the client to the server
    await client.connect();
    // Select the database you want to work with
    db = client.db(process.env.DB_NAME);
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err; // Throw the error so that the calling code knows about the failure
  }
}

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

connectDB()
  .then(() => {
    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.get("/comments", async (req, res) => {
      const { tag } = req.query;

      if (!tag) {
        return res.status(400).send("query tag required");
      }

      try {
        const data = await db
          .collection("be-wedding-inv")
          .find({ tag })
          .toArray();
        res.json(data);
      } catch (error) {
        console.error("ERROR:", error);
        res.status(500).send("Error fetching comments.");
      }
    });

    app.post("/comment", async (req, res) => {
      const { name, comment, tag } = req.body;

      const now = new Date();
      try {
        await db.collection("be-wedding-inv").insertOne({
          name,
          comment,
          tag,
          created_at: now,
        });
        res.send("Comment saved successfully!");
      } catch (error) {
        console.error("ERROR:", error);
        res.status(500).send("Error saving comment.");
      }
    });
  })
  .catch((err) => {
    console.error("Failed to start server", err);
  });

app.listen(port, () => console.log(`Listening on port ${port}`));
