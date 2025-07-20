const { default: mongoose } = require("mongoose");

const BankSchema = new mongoose.Schema({
    accountNo: {
        type: Number,
        require: true,
    },
    balance: {
        type: Number,
        default: 1000000000000
    }
});

module.exports = mongoose.model('Bank', BankSchema);