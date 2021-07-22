const axios = require('axios');
const _ = require('lodash');
const moment = require('moment');
const { ethers } = require('ethers');
const tweet = require('./tweet');

function formatAndSendTweet(event) {
    const tokenName = _.get(event, ['asset', 'name']);
    const image = _.get(event, ['asset', 'image_url']);
    const openseaLink = _.get(event, ['asset', 'permalink']);
    const totalPrice = _.get(event, 'total_price');
    const usdValue = _.get(event, ['payment_token', 'usd_price']);
    const horseData = _.get(event, ['asset', 'token_metadata']);

    const formattedEthPrice = ethers.utils.formatEther(totalPrice.toString());
    const formattedUsdPrice = (formattedEthPrice * usdValue).toFixed(2);
	
async function makeGetRequest() {

  let res = await axios.get(horseData);

  let data = res.data;
  console.log(data);
}

makeGetRequest();
    
    // Printing all the values from the resulting object
     //const color = `Coat Color: ` + horseAttributes.attributes[0].value;
     //const bloodline = `Bloodline: ` + horseAttributes.attributes[1].value;
     //const breed = `Breed: ` + horseAttributes.attributes[2].value;
     //const genotype = `Genotype: ` + horseAttributes.attributes[3].value;
     //const gender = `Gender: ` + horseAttributes.attributes[4].value;

    const tweetText = `${tokenName}
    SOLD for ${formattedEthPrice}Ξ
    ${openseaLink}?ref=oxf5c546b595e8e103014dc0aa49fa6f199efcce9d`;

    console.log(tweetText);

    return tweet.handleDupesAndTweet(tokenName, tweetText, image);
}

// Poll OpenSea every minute & retrieve all sales for a given collection in the last minute
// Then pass those events over to the formatter before tweeting
setInterval(() => {
    const lastMinute = moment().startOf('minute').subtract(59, "seconds").unix();

    axios.get('https://api.opensea.io/api/v1/events', {
        params: {
            collection_slug: process.env.OPENSEA_COLLECTION_SLUG,
            event_type: 'successful',
            occurred_after: lastMinute,
            only_opensea: 'false'
        }
    }).then((response) => {
        const events = _.get(response, ['data', 'asset_events']);

        console.log(`${events.length} sales in the last minute...`);

        _.each(events, (event) => {
            return formatAndSendTweet(event);
        });
    }).catch((error) => {
        console.error(error);
    });
}, 60000);
