
const express = require("express");
const bodyParser = require("body-parser");
const cors =require('cors');
const mongoose=require("mongoose");

const app = express();
const EmployeeModel =require('./models/Employee')
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
require('dotenv').config(); // Load variables from .env file

app.use(express.json());
app.use(cors());

const uri = process.env.DATABASE; // Use the DATABASE variable from .env

mongoose.connect(uri,{ useNewUrlParser:true ,useUnifiedTopology: true, })
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Error connecting to MongoDB:', error));
mongoose.Promise = global.Promise;

//post the data to mongodb atlas set id 1 to continuously 
app.post('/create', async (req, res) => {
  try {
    // Check if the email already exists
    const existingData = await EmployeeModel.findOne({ email: req.body.email });

    if (existingData) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Find the latest data document and get its ID
    const latestData = await EmployeeModel.findOne({}, {}, { sort: { acc_id: -1 } });
    let nextId = 1;

    if (latestData) {
      // If there is existing data, increment the ID for the next data
      nextId = latestData.acc_id + 1;
    }

    // Create a new data document with the next ID
    const newData = new EmployeeModel({
      acc_id: nextId,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      balance: Number(req.body.balance)
    });

    // Save the new data to the database
    await newData.save();

    // Return the newly created data as the response
    res.json(newData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// sign in 
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await EmployeeModel.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    return res.status(200).json({ message: 'Sign-in successful' });
  } catch (error) {
    console.error('Sign-in error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


//deposit amount to mongodb atlas
app.post("/deposit", function (req, res) {
  let acc = req.body.acc_Id;
  let deposit = Number(req.body.deposit);
  EmployeeModel.findOne({ acc_id: acc })
    .then(function (employee,res) {
      if (employee) {
        // Calculate the new balance by adding the deposit amount
        let newBalance = employee.balance + deposit;
        // Update the balance of the employee
        employee.balance = newBalance;
        // Save the updated employee data
        return employee.save();
      } else {
        throw new Error("Account not found");
      }
    })
    .then(function () {
      console.log("Balance updated successfully");
    })
    .catch(function (err) {
      console.log(err);
    });
});

//withdraw amount 

app.post("/withdraw", function (req, res) {
  let acc = req.body.acc_Id;
  let withdraw = Number(req.body.withdraw);
  EmployeeModel.findOne({ acc_id: acc })
    .then(function (employee) {
      if (employee) {
        // Calculate the new balance by adding the deposit amount
        let newBalance = employee.balance - withdraw;
        // Update the balance of the employee
        employee.balance = newBalance;
        // Save the updated employee data
        return employee.save();
      } else {
        throw new Error("Account not found");
      }
    })
    .then(function (users) {
      console.log("Balance updated successfully");
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.get('/getlist', (req, res) => {
  EmployeeModel.find()
    .then(employees => res.json(employees))
    .catch(err => res.json(err))
});


// Route for fetching data based on ID
app.get('/getAccount/:id', (req, res) => {
  const accountId = req.params.id;

  EmployeeModel.findOne({ acc_id: accountId })
    .then(account => {
      if (!account) {
        res.status(404).json({ error: 'Account not found' });
      } else {
        res.json(account);
      }
    })
    .catch(err => {
      console.error('Error retrieving account:', err);
      res.status(500).json({ error: 'Error retrieving account' });
    });
});

//delete using id
app.delete('/deleteAccount/:id', (req, res) => {
  const accountId = req.params.id;

  EmployeeModel.deleteOne({ acc_id: accountId })
    .then(result => {
      if (result.deletedCount === 0) {
        res.status(404).json({ error: 'Account not found' });
      } else {
        res.json({ message: 'Account deleted successfully' });
      }
    })
    .catch(err => {
      console.error('Error deleting account:', err);
      res.status(500).json({ error: 'Error deleting account' });
    });
});

app.listen(4000, () => {
 console.log("Server running on port 4000");
});