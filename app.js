require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.DB_URL;

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
    db = client.db("banu");
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
        const data = await db.collection("be-wedding-inv").find({ tag }).toArray();
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
        await db
          .collection("be-wedding-inv")
          .insertOne({ name: name, comment: comment, tag: tag, created_at: now });
        res.send("Comment saved successfully!");
      } catch (error) {
        console.error("ERROR:", error);
        res.status(500).send("Error saving comment.");
      }
    });

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server", err);
  });
