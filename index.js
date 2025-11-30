const express = require("express");
const cors = require("cors");
require ('dotenv').config();

// for connect to the database
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;


// middleware
app.use(cors());
app.use(express.json());


  const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster33.pzhkenb.mongodb.net/?appName=Cluster33`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Smart server is running");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("movie_db");
    const moviesCollection = db.collection("movies");
    const usersCollection = db.collection("users");
    const watchlistCollection = db.collection("watch-list");
  

    // Users APIs
    app.post("/users", async (req, res) => {
      const newUser = req.body;

      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        res.send({
          message: "user already exits. Do not insert again same data!",
        });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    //WatchList API
    app.post("/watchlist", async (req, res) => {
      try {
        const {
          userEmail,
          movieId,
          title,
          posterUrl,
          genre,
          releaseYear,
          rating,
        } = req.body;

        if (!userEmail || !movieId) {
          return res
            .status(400)
            .send({ message: "userEmail and movieId are required" });
        }

        // prevent duplicate for same user + movie
        const existing = await watchlistCollection.findOne({
          userEmail,
          movieId,
        });
        if (existing) {
          return res
            .status(409)
            .send({ message: "Movie already in watchlist" });
        }

        const doc = {
          userEmail,
          movieId,
          title,
          posterUrl,
          genre,
          releaseYear,
          rating,
          createdAt: new Date(),
        };

        const result = await watchlistCollection.insertOne(doc);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to add to watchlist" });
      }
    });



    // myWatchList - get watchList for a user
    app.get("/watchlist", async (req, res) => {
      try {
        const userEmail = req.query.email;

        if (!userEmail) {
          return res.status(400).send({ message: "email query is required" });
        }

        const cursor = watchlistCollection.find({ userEmail });
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to load watchlist" });
      }
    });

  
app.get("/movies", async (req, res) => {
  try {
    const { genres, minRating, maxRating } = req.query;

    const query = {};

    // Filter by multiple genres
    if (genres) {
      const genresArray = genres.split(","); 
      query.genre = { $in: genresArray };
    }

    // Filter by rating range
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }

    const cursor = moviesCollection.find(query); //.sort({ created_at: -1 });
    const result = await cursor.toArray();

    res.send(result);
  } catch (error) {
    console.error("Error fetching movies with filters:", error);
    res.status(500).send({ message: "Failed to load movies" });
  }
});


    
    // GET movies for a specific user (My Collection)
  
    app.get("/movies/my-collection", async (req, res) => {
      try {
        const email = req.query.email;

        if (!email) {
          return res
            .status(400)
            .send({
              message:
                "Email query is required, e.g. /movies/my-collection?email=abc@gmail.com",
            });
        }

        const cursor = moviesCollection.find({ email }); 
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching my collection:", error);
        res.status(500).send({ message: "Failed to load your collection" });
      }
    });

    //get single movie
    app.get("/movies/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await moviesCollection.findOne(query);

      if (!result) {
        return res.status(404).send({ message: "Movie not found" });
      }

      res.send(result);
    });

    // get the latest movies
    app.get("/latest-movies", async (req, res) => {
      const cursor = moviesCollection.find().sort({ created_at: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/top-rated-movies", async (req, res) => {
      const cursor = moviesCollection.find().sort({ rating: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });


    app.post("/movies", async (req, res) => {
      try {
        const newMovie = req.body;

        // basic validation
        if (
          !newMovie.title ||
          !newMovie.posterUrl ||
          !newMovie.genre ||
          !newMovie.releaseYear ||
          !newMovie.rating
        ) {
          return res
            .status(400)
            .send({ message: "All fields including user email are required" });
        }

        newMovie.created_at = new Date();

        const result = await moviesCollection.insertOne(newMovie);
        res.send(result);
      } catch (error) {
        console.error("Error adding movie:", error);
        res.status(500).send({ message: "Failed to add movie" });
      }
    });

    //delete a movie
    app.delete("/movies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await moviesCollection.deleteOne(query);
      res.send(result);
    });

    // Update a movie
app.patch("/movies/:id", async (req, res) => {
  const id = req.params.id;
  const updateData = req.body; 

  try {
    const result = await moviesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "Movie not found" });
    }

    res.send({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Error updating movie:", err);
    res.status(500).send({ message: "Failed to update movie" });
  }
});



   // Remove a movie from the watchlist
app.delete("/watchlist/:id", async (req, res) => {
  const { id } = req.params;
  const email = req.query.email; // frontend sends ?email=...

  if (!email) return res.status(400).json({ error: "email required" });

  try {
    
    const objectId = new ObjectId(id);

    const result = await watchlistCollection.deleteOne({
      _id: objectId,
      userEmail: email,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "Item not found or not owned by user" });
    }

    return res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("DELETE /watchlist/:id error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {

  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Smart server is running on port: ${port}`);
});
