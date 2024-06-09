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
    const donorInfoCollection = client.db('bloodDonation').collection('donorInfo');

    // ========
    app.post('/user_data', async (req, res) => {
      const item = req.body;
      const result = await userDataCollection.insertOne(item);
      res.send(result);
    })

    app.get('/user_data', async(req, res) => {
      const result = await userDataCollection.find().toArray();
      res.send(result);
    })

    app.get('/user_data/:email', async(req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const result = await userDataCollection.findOne(query);
      res.send(result);
    })

    app.post('/create_all_requests', async (req, res) => {
      const request = req.body;
      const result = await allRequestsCollection.insertOne(request);
      res.send(result);
    })

    app.get('/all_donation_requests', async(req, res) => {
      const result = await allRequestsCollection.find().toArray();
      res.send(result);
    })

    app.post('/store_donar_info', async(req, res) => {
      const donorInfo = req.body;
      const result = await donorInfoCollection.insertOne(donorInfo);
      res.send(result);
    })

    app.get('/store_donor_info', async(req, res) => {
      const result = await donorInfoCollection.find().toArray();
      res.send(result);
    })

    app.get('/store_donor_info/:id', async(req, res) => {
      const id = req.params.id;
      const query = {id: id};
      const result = await donorInfoCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/donation_requests', async (req, res) => {
      const query = {};
      const options = {
        projection: { recipient_name: 1, division: 1, district: 1, upazila: 1, donation_date: 1, donation_time: 1, donation_status: 1 },
        filter: { donation_status: 'pending' }
      }
      const results = await allRequestsCollection.find(query, options).toArray();
      // Filter out any remaining "inprogress" requests from the results
      const filteredResults = results.filter(item => item.donation_status === 'pending');
      res.send(filteredResults);
    })

    app.get('/my_donation_requests/:email', async (req, res) => {
      const email = req.params.email;
      const query = { requester_email: email };
      const result = await allRequestsCollection.find(query).toArray();
      res.send(result);
  });

    app.get('/requests_details/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await allRequestsCollection.findOne(query);
      res.send(result);
    })

    // change status to inprogress
    app.patch('/change_request_status/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          donation_status: 'inprogress'
        }
      }
      const result = await allRequestsCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    // change status to done
    app.patch('/change_status_done/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          donation_status: 'done'
        }
      }
      const result = await allRequestsCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    // change status to cancel
    app.patch('/change_status_cancel/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          donation_status: 'cancel'
        }
      }
      const result = await allRequestsCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    // change status by admin
    app.patch('/update_status_by_admin/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updateValue = {
        $set: {
          status: 'blocked'
        }
      } 
      const result = await userDataCollection.updateOne(filter, updateValue);
      res.send(result);
    })

    // change status by admin
    app.patch('/update_status_by_admin_active/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateStatus = {
        $set: {
          status: 'active'
        }
      }
      const result = await userDataCollection.updateOne(filter, updateStatus);
      res.send(result);
    })

    // change role by admin
    app.patch('/make_role_volunteer/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateRole = {
        $set: {
          role: 'volunteer'
        }
      }
      const result = await userDataCollection.updateOne(filter, updateRole);
      res.send(result);
    })

    // change role by admin
    app.patch('/make_role_admin/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateRole = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userDataCollection.updateOne(filter, updateRole);
      res.send(result);
    })

    // upadate data 
    app.put('/update_my_profile/:email', async(req, res) => {
      const email = req.params.email;
      const filter = {email: email};
      const options = {upsert: true};
      const updateData = req.body;
      const data = {
        $set: {
          name: updateData.name,
          email: updateData.email,
          division: updateData.division,
          district: updateData.district,
          upazila: updateData.upazila,
          blood: updateData.blood
        }
      }
      const result = await userDataCollection.updateOne(filter, data, options);
      res.send(result);
    })

    app.put('/update_request/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updateData = req.body;
      const data = {
        $set : {
          requester_name: updateData.requester_name,
          requester_email: updateData.requester_email,
          recipient_name: updateData.recipient_name,
          division: updateData.division,
          district: updateData.district,
          upazila: updateData.upazila,
          blood: updateData.blood,
          donation_date: updateData.donation_date,
          donation_time: updateData.donation_time,
          hospital_name: updateData.hospital_name,
          full_address: updateData.full_address,
          request_message: updateData.request_message,
          donation_status: updateData.donation_status
        }
      } 
      const result = await allRequestsCollection.updateOne(filter, data, options);
      res.send(result);
    })

    app.delete('/request_delete/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await allRequestsCollection.deleteOne(query);
      res.send(result);
    })



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