const { application } = require('express');
const bodyParser = require('body-parser');
const express = require('express');
const PubSub = require('./pub-sub');
const Blockchain = require('./blockchain');

const PORT = 3000;
const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data });
    // pubsub.publish({ 
    //     channel: 'BLOCKCHAIN',
    //      message: JSON.stringify(blockchain.chain) 
    // });

    res.redirect('/api/blocks');
});

app.listen(PORT, () => console.log(`listening at localhost:${PORT}`));