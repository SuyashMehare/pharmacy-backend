require('dotenv').config()

const cors = require('cors');
const conn = require('../../configs/db.confing')
const Rezorpay = require('../models/rezorpay.model')
const express = require('express');
const app = express();

app.use(cors({
    origin: "*",
    methods: ['POST', 'GET', 'PATCH']
}))

app.use(express.json())

app.get('/rezorpay', async (req, res) => {
    try {
        const tx = await Rezorpay.find();
        res.status(200).json({
            success: true,
            message: 'All tx info',
            tx
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

// init from application backend: partial creation
app.post('/rezorpay/init', async (req, res) => {
    const { txId, amount, to } = req.body;

    try {
        const transaction = await Rezorpay.create({
            txId,
            amount,
            toAccountNo: to,
        })

        res.status(200).json({
            success: true,
            succ_code: 'TX_CREATED',
            message: 'Transaction successfully created'
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

// sent from user: complete execution
app.patch('/rezorpay/sent', async (req, res) => {
    const { txId, from } = req.body;

    try {

        const rezorpayTx = await Rezorpay.findOneAndUpdate({ txId }, {fromAccountNo: from}, {new: true});
        const body = {
            from: rezorpayTx.fromAccountNo,
            to: rezorpayTx.toAccountNo,
            ammount: rezorpayTx.amount
        }


        const bankRes = await fetch(`${process.env.BANK_URL}/bank/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const jsonBankRes = await bankRes.json();
        const { success, err_code, succ_code } = jsonBankRes
        
        if (!success) {
            await Rezorpay.findOneAndUpdate({ txId }, {status: "abort", abortReason: err_code})
            return res.status(403).json({success, status: "abort", err_code})
        }

        await Rezorpay.findOneAndUpdate({ txId }, {status: "paid"})


        const txSuccessBody = {
            txId
        }

        await fetch('http://localhost:3000/api/v1/transaction/success/status/initiate', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(txSuccessBody)
        });

        

        res.status(200).json({success, status: "paid",succ_code})
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

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        err_code: 'ROUTE_NOT_FOUND',
        message: 'Route not found (rezorpay)'
    })
})


conn()
.then(() => {
    app.listen(5222, () => console.log('Rezorpay server listening at port 5222'))
})



/// initiator:
/**
 * txid and amount and currency and to
 * 
 */

/// responder:
/***
 * send txId and
 * 
 */