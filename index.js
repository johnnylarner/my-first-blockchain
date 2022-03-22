const request = require('request');
const bodyParser = require('body-parser');
const express = require('express');
const config = require('config');
const PubSub = require('./pub-sub');
const Blockchain = require('./blockchain');

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

const DEFAULT_PORT = config.get('server.default-port');
const DEFAULT_HOST = config.get('server.default-host');
let PEER_PORT;

const ROOT_NODE_ADDRESS = `http://${DEFAULT_HOST}${DEFAULT_PORT}`;

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;

    blockchain.addBlock({ data });
    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

const syncChain = () => {
    request(
        { url: `${ROOT_NODE_ADDRESS}/api/blocks`},
        (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const rootChain = JSON.parse(body);

                console.log('syncing chain with', rootChain);
                blockchain.replaceChain(rootChain)
            }
        });
};

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random()*1000);
}

const PORT = PEER_PORT || DEFAULT_PORT // Returns first truthy value
app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`);

    if (PORT !== DEFAULT_PORT) syncChain();    
});