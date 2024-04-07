const mongoose = require('mongoose');
const EmployeeSchema = new mongoose.Schema({
    acc_id: Number,
    name: String,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: String,
    balance: Number,
});


const EmployeeModel =  mongoose.model("employees",EmployeeSchema);
module.exports = EmployeeModel;