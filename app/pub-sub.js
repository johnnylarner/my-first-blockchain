const redis = require('redis');
const Blockchain = require('../blockchain');

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
}

class PubSub {
    constructor({ blockchain }) {
        this.blockchain = blockchain;

        this.publisher = redis.createClient();
        this.publisher.connect();

        this.subscriber = redis.createClient();
        this.subscriber.connect();
        
        this.publisher.on('error', (err) => console.log('Redis Client Error', err)); 
        this.subscriber.on('error', (err) => console.log('Redis Client Error', err)); 

        this.subscribeToChannels();
    }

    handleMessage(message, channel) {    
        console.log(`Message received. Channel ${channel}. Message: ${message}.`);

        const parsedMessage = JSON.parse(message);

        if (channel === CHANNELS.BLOCKCHAIN) {
            this.blockchain.replaceChain(parsedMessage);
        }
    }

    subscribeToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(
                channel, 
                (message) => this.handleMessage(message, channel)
        )});
    }

    publish({ channel, message }) {
        
        this.subscriber.unsubscribe(channel)
          .then(
              this.publisher.publish(channel, message)
                .then(() => {
                  this.subscriber.subscribe(
                      channel, 
                      (message) => this.handleMessage(message, channel)
                )}));
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }
}   

module.exports = PubSub;