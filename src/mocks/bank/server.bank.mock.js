require('dotenv').config()

const cors = require('cors');
const express = require('express');
const conn = require('../../configs/db.confing')
const Bank = require('../models/bank.model')
const app = express();

app.use(cors({
    origin: "*",
    methods: ['POST', 'GET']
}))

app.use(express.json())


app.get('/bank', async (req, res) => {
    try {
        const accounts = await Bank.find();
        res.status(200).json({
            success: true,
            message: 'All user accounts info',
            accounts
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'server error',
            error: error.message
        })
    }
})

app.get('/bank/:account', async (req, res) => {
    const accountNo = req.params.account;
    try {
        const userAccount = await Bank.find({ accountNo });
        res.status(200).json({
            success: true,
            message: 'Single user accounts info',
            userAccount
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'server error',
            error: error.message
        })
    }
})



app.post('/bank/create', async (req, res) => {
    const { accountNo } = req.body;

    try {
        const userAccount = await Bank.create({
            accountNo
        })

        res.status(200).json({
            success: true,
            succ_code: 'ACC_CREATED',
            message: 'User account created',
            userAccount
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            err_code: 'UNKNOWN_ERROR',
            message: 'Unknown error',
            error: error.message
        })
    }

})


app.post('/bank/transfer', async (req, res) => {
    const { from, to, ammount } = req.body;

    let session = null;
    try {
        const fromAccount = await Bank.findOne({ accountNo: from });

        if(fromAccount.balance - ammount < 0) {
            return res.status(403).json({
                success: false,
                err_code: 'INSUFFICENT_AMOUNT',
                fromAccountNo: fromAccount.accountNo
            })
        }


        session = await Bank.startSession()

        await session.withTransaction(async () => {
            await Bank.findOneAndUpdate({ accountNo: from }, { $inc: { balance: - ammount } }, { session });
            await Bank.findOneAndUpdate({ accountNo: to }, { $inc: { balance: ammount } }, { session });
        })

        res.status(200).json({
            success: true,
            succ_code: 'TX_DONE',
            message: 'Transaction successfully executed'
        })
    } catch (error) {
        console.error(error);
        await session.abortTransaction();
        res.status(500).json({
            success: false,
            err_code: 'UNKNOWN_ERROR',
            message: 'Unknown error',
            error: error.message
        })
    } finally  {
        if(session) await session.endSession()
    }

})

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        err_code: 'ROUTE_NOT_FOUND',
        message: 'Route not found (bank)'
    })
})

conn()
.then(() => {
    app.listen(5211, () => console.log('Bank server listening at port 5211'))
})

