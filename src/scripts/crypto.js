const { Client } = require('@notionhq/client');
const axios = require('axios');

const notion = new Client({
  auth: process.env['NOTION_API_KEY'],
  baseUrl: 'https://api.notion.com',
});

const getCoins = async (databaseId) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: 'Hidden',
          checkbox: {
            equals: false,
          },
        },
      ],
    },
  });
  return response.results;
};

const getCoinsInfo = async (coins) => {
  const res = await axios.get(
    'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
    {
      params: {
        symbol: coins.join(','),
      },
      headers: {
        'X-CMC_PRO_API_KEY': process.env['CMC_PRO_API_KEY'],
      },
    }
  );
  if (res.status !== 200) {
    return null;
  }
  return res.data.data;
};

const updateCoinPrice = (pageId, price) => {
  return notion.pages.update({
    page_id: pageId,
    properties: {
      'Current Price': {
        number: price,
      },
    },
  });
};

(async () => {
  const databaseId = process.env['NOTION_DATABASE_ID'];
  const coins = await getCoins(databaseId);
  console.log(coins);
  const coinNames = Array.from(
    new Set(
      coins.map((page) => {
        return page.properties.Name.title[0].plain_text;
      })
    )
  );
  const coinsInfo = await getCoinsInfo(coinNames);
  console.log(coinsInfo);

  const coinsWithInfoPromises = coins.map((coin) => {
    const coinName = coin.properties.Name.title[0].plain_text;
    const coinInfo = coinsInfo[coinName];
    return updateCoinPrice(coin.id, coinInfo.quote.USD.price);
  });

  await Promise.all(coinsWithInfoPromises);
})();
