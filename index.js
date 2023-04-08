const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");

const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lhckmem.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const usersCollection = client.db("ChipherSchools").collection("allUser");

    // ------- Authentication section start --------//
    // User registration endpoint
    app.post("/register", async (req, res) => {
      const { email, password } = req.body;
      console.log(req.body);
      // Check if user already exists
      const user = await usersCollection.findOne({ email });
      if (user) {
        return res
          .status(409)
          .json({ message: "Email already in used", status: 409 });
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Insert the new user into the database
      const result = await usersCollection.insertOne({
        email,
        password: hashedPassword,
      });

      res.status(200).json({ message: "User created", status: 200, result });
    });
    
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", async (req, res) => {
  res.send("ChipherSchools server is running");
});

app.listen(port, () => console.log(`ChipherSchools server running on ${port}`));
