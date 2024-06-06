const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors({
    origin: [
      'http://localhost:5173'
    ]
  }));
app.use(express.json());

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9nu6wnq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const userDataCollection = client.db('bloodDonation').collection('userData');
    const allRequestsCollection = client.db('bloodDonation').collection('createAllDonetionRequests');


    // ========
    app.post('/user_data', async(req, res) => {
        const item = req.body;
        const result = await userDataCollection.insertOne(item);
        res.send(result);
    })

    app.post('/create_all_requests', async(req, res) => {
      const request = req.body;
      const result = await allRequestsCollection.insertOne(request);
      res.send(result);
    })

    app.get('/donation_requests', async(req, res) => {
      const query = {};
      const options = {
        projection: {recipient_name: 1, division: 1, district: 1, upazila: 1, donation_date: 1, donation_time: 1, donation_status: 1 }
      }
      const result = await allRequestsCollection.find( query, options).toArray();
      res.send(result);
    })

    // app.get('/donation_requests', async(req, res) => {
    //   const result = await allRequestsCollection.find().toArray();
    //   res.send(result);
    // })

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Blood donation server is running');
})

app.listen(port, () => {
    console.log(`Blood donation server is running on port: ${port}`)
}) 