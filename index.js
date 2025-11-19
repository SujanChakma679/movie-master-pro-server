const express = require('express');
const cors = require('cors');

// for connect to the database
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://simpleDBUser:Hruc3M2SO2eiQIJh@cluster33.pzhkenb.mongodb.net/?appName=Cluster33";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req,res) =>{
    res.send('Smart server is running')
})

async function run() {
  try {

    await client.connect();

    const db = client.db('movie_db');
    const moviesCollection = db.collection('movies');
    const usersCollection = db.collection('users');
    const watchlistCollection = db.collection('watch-list');

      // Users APIs 
        app.post('/users', async(req, res) =>{
          const newUser = req.body;

          const email = req.body.email;
          const query = {email: email}
          const existingUser = await usersCollection.findOne(query);


          if(existingUser){
            res.send({message :'user already exits. Do not insert again same data!'})
          }
          else{
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
          }
        })

        //WatchList API
        app.post('/watchlist', async (req, res) => {
  try {
    const { userEmail, movieId, title, posterUrl, genre, releaseYear, rating } = req.body;

    if (!userEmail || !movieId) {
      return res.status(400).send({ message: "userEmail and movieId are required" });
    }

    // prevent duplicate for same user + movie
    const existing = await watchlistCollection.findOne({ userEmail, movieId });
    if (existing) {
      return res.status(409).send({ message: "Movie already in watchlist" });
    }

    const doc = {
      userEmail,
      movieId,
      title,
      posterUrl,
      genre,
      releaseYear,
      rating,
      createdAt: new Date()
    };

    const result = await watchlistCollection.insertOne(doc);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to add to watchlist" });
  }
});

// myWatchList - get watchlist for a user
app.get('/watchlist', async (req, res) => {
  try {
    const userEmail = req.query.email;  // /watchlist?email=...

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





    //get all movies
    
    app.get('/movies', async(req, res) =>{
        const cursor = moviesCollection.find();  //.sort({created_at: -1});
        const result = await cursor.toArray();
        res.send(result)
    })


//get single movie 
app.get('/movies/:id', async (req, res) => {
  const id = req.params.id;

  const query = { _id: id };  
  const result = await moviesCollection.findOne(query);

  if (!result) {
    return res.status(404).send({ message: 'Movie not found' });
  }

  res.send(result);
});




    // get the latest movies
    app.get('/latest-movies', async(req, res) =>{
      const cursor = moviesCollection.find().sort({created_at: -1}).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })

      app.get('/top-rated-movies', async(req, res) =>{
      const cursor = moviesCollection.find().sort({rating: -1}).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })

    //get the specific user movies

    app.get('/movies/my-collection', async (req, res) =>{


        console.log(req.query)
        const email = req.query.email;
        const query = {}
        if(email){
          query.email = email;
        }


        const cursor = moviesCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
       });

     

        //create a movie
        app.post('/movies/add', async(req, res) =>{
            const newMovie = req.body;
            const result = await moviesCollection.insertOne(newMovie)
            res.send(result);
    })

    //delete a movie
        app.delete('/movies/:id', async(req, res) =>{
          const id = req.params.id;
          const query = { _id: new ObjectId(id) }
          const result = await moviesCollection.deleteOne(query)
          res.send(result)
        })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.listen(port, () =>{
    console.log(`Smart server is running on port: ${port}`)
})