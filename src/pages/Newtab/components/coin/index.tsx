import Window from '@/components/common/window';
import { Separator } from '@/components/ui/separator';
import storage from '@/lib/storage';
import { useWindowState } from '@/pages/Newtab/hooks/useWindowState';
import axios from 'axios';
import React from 'react';
import secrets from 'secrets';

const Coin = () => {
  const [coins, setCoins] = React.useState<any[]>([]);
  const {
    state,
    isFullScreen,
    handleChangeState,
    handleToggleFullScreen,
    handleClose,
  } = useWindowState('coin');

  React.useEffect(() => {
    const fetchCoins = async () => {
      const cacheKey = storage.KEYS.cmcListings;
      const cacheTimeout = 1000 * 60 * 60;
      const result = storage.getLocalStorage(cacheKey);
      if (result) {
        setCoins(result);
      } else {
        const res = await axios.get(
          'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
          {
            headers: {
              'X-CMC_PRO_API_KEY': secrets.CMC_PRO_API_KEY,
            },
          }
        );
        if (res.status !== 200) {
          return;
        }
        setCoins(res.data.data);
        storage.setLocalStorage(cacheKey, res.data.data, cacheTimeout);
      }
    };

    fetchCoins();
  }, []);

  if (!state) {
    return null;
  }

  return (
    <Window
      {...state}
      onChangeState={handleChangeState}
      onToggleFullScreen={handleToggleFullScreen}
      onClose={handleClose}
    >
      <div
        className={`flex w-full ${
          isFullScreen ? 'flex-wrap gap-4' : 'overflow-hidden gap-2'
        }`}
      >
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="flex-col items-center justify-center text-center text-black dark:text-gray-200"
          >
            <a
              href={`https://coinmarketcap.com/currencies/${coin.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                className="w-6 h-6 mx-auto"
                src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                alt={coin.name}
              />
              <div className="text-sm truncate">{coin.name}</div>
              <div className="text-sm">{coin.quote.USD.price.toFixed(2)}</div>
              <div
                className={`${
                  coin.quote.USD.percent_change_24h > 0
                    ? 'text-green-500 dark:text-green-500'
                    : 'text-red-500 dark:text-red-500'
                } text-xs`}
                title="24h change"
              >
                {Math.abs(coin.quote.USD.percent_change_24h).toFixed(2)}%
              </div>
              <div
                className={`${
                  coin.quote.USD.percent_change_7d > 0
                    ? 'text-green-500 dark:text-green-500'
                    : 'text-red-500 dark:text-red-500'
                } text-xs`}
                title="7d change"
              >
                {Math.abs(coin.quote.USD.percent_change_7d).toFixed(2)}%
              </div>
            </a>
          </div>
        ))}
      </div>
    </Window>
  );
};

export default Coin;
