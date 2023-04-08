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
      const { firstName, lastName, image, email, password } = req.body;
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
        firstName,
        lastName,
        image,
        email,
        password: hashedPassword,
      });

      res.status(200).json({
        message: "User created successful",
        status: 200,
        result,
        user: req.body,
      });
    });

    // User login endpoint
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      // Check if user exists
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid email or password", status: 401 });
      }

      // Check if password is correct
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: "Invalid email or password", status: 401 });
      }
      const users = await usersCollection.find({ email }).toArray();
      console.log(users);

      res.status(200).json({ message: "Login successful", status: 200, user: users[0] });
    });

    // ------ Authentication section  END ---------//
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", async (req, res) => {
  res.send("ChipherSchools server is running");
});

app.listen(port, () => console.log(`ChipherSchools server running on ${port}`));
