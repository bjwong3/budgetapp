const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection string (replace with your actual MongoDB Atlas connection string)
const uri = "mongodb+srv://brandonjwong:4x5tXbvSWaQ83IFP@userdata.xolmk.mongodb.net/?retryWrites=true&w=majority&appName=UserData";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Define a Mongoose schema for the users collection
const userSchema = new mongoose.Schema({
  email: String,
  income: Number,
	monthlyExpense: {
    type: Map,
    of: Number
  },
	addExpense: {
    type: Map,
    of: Number
  },
  lastAccessedYear: Number,
  lastAccessedMonth: Number,
  history: {
    type: Map,
    of: Object
  }
});

const User = mongoose.model('User', userSchema);

// GET endpoint to fetch a specific user by email
app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }); // Find user by email
    if (user) {
      res.json(user); // Send user data to the client
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT endpoint to update a specific user by email
app.put('/api/users/:email', async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: req.params.email }, // Find user by email
      req.body,                    // Update with request body data
      { new: true }                // Return the updated document
    );

    if (updatedUser) {
      res.json(updatedUser); // Send the updated user data to the client
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  const newUser = new User(req.body); // Create a new User document from the request body
  try {
    const savedUser = await newUser.save(); // Save the new user to the collection
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});