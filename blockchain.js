const express = require('express')
const bodyParser = require('body-parser')
const uuidv1 = require('uuid/v1')
const crypto = require('crypto')
const app = express()
const port = 5000


function Blockchain() {

    var currentTransactions = []
    var chain = []
    var nodes = {}

    this.newBlock = (proof, previousHash) => {
        var block = {
            index: chain.length + 1,
            timestamp: new Date().getTime(),
            transactions: this.currentTransactions,
            proof: proof,
            previous_hash: previousHash || this.hash(chain[-1]),
        }

        // Reset the current list of transactions
        this.currentTransactions = []
        chain.push(block)
        return block
    }

    this.newTransaction = (sender, recipient, amount) => {
        this.currentTransactions.append({
            sender,
            recipient,
            amount,
        })
        return self.lastBlock['index'] + 1
    }

    this.lastBlock = () => chain[-1]

    this.hash = block => {
        var blockString = JSON.stringify(block, Object.keys(block).sort())
        return crypto.createHash('sha256').update(blockString).digest('hex')
    }

    this.proofOfWork = (block=null, difficulty=4) => {
        block = block || self.lastBlock()
        while (true) {
            block["nonce"] = this.nonce()
            if (this.powIsAcceptable(this.hash(block), difficulty)) {
                console.log("Block hash is {self.hash(block)} with random string " + block['nonce'])
                return block
            }
        }
    }

    this.validProof = (lastProof, proof, lastHash) => {
        var guess = (lastProof + proof + lastHash) // hex
        var guessHash = crypto.createHash('sha256').update(guess).digest('hex')
        return guessHash.substr(4) == "0000"
    }

    this.nonce = () => crypto.createHash('sha256').update(uuidv1()).digest('hex')


    // Create the genesis block
    this.newBlock('1', 100)

}


var blockchain = new Blockchain()


app.get('/mine', (req, res) => {
    // We run the proof of work algorithm to get the next proof...
    var lastBlock = blockchain.lastBlock
    var proof = blockchain.proofOfWork(lastBlock)

    // We must receive a reward for finding the proof.
    // The sender is "0" to signify that this node has mined a new coin.
    blockchain.newTransaction(
        sender = "0",
        recipient = nodeIdentifier,
        amount = 1,
    )

    // Forge the new Block by adding it to the chain
    var prevHash = blockchain.hash(lastBlock)
    var block = blockchain.newBlock(proof, prevHash)

    return res.send({
        message: "New Block Forged",
        index: block['index'],
        transactions: block['transactions'],
        proof: block['proof'],
        previous_hash: block['previous_hash'],
    })
})

app.post('/transactions/new', bodyParser.json(), (req, res) => {
    // validate
    var {sender, recipient, amount} = req.body

    // create new transaction
    var index = blockchain.newTransaction(sender, recipient, amount)
    return res.status(201).send({'message': 'Transaction will be added to Block ' + index})
})

app.get('/chain', (req, res) => res.send({
    chain: blockchain.chain,
    length: blockchain.chain.length
}))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))