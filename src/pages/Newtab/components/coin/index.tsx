import Window from '@/components/common/window';
import { CardContent } from '@/components/ui/card';
import storage from '@/lib/storage';
import axios from 'axios';
import React from 'react';
import secrets from 'secrets';

const Coin = () => {
  const [state, setState] = React.useState<any>();
  const [coins, setCoins] = React.useState<any[]>([]);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  React.useEffect(() => {
    const state = storage.getLocalStorage(storage.KEYS.coinWindowRndState);
    if (state) {
      setState(state);
    } else {
      setState({
        x: 5,
        y: 5,
        width: 750,
        height: 80,
      });
    }

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
        // console.log(res.data);
        setCoins(res.data.data);
        storage.setLocalStorage(cacheKey, res.data.data, cacheTimeout);
      }
    };

    fetchCoins();
  }, []);

  const handleChangeState = (state: any) => {
    storage.setLocalStorage(storage.KEYS.coinWindowRndState, state);
  };

  const handleToggleFullScreen = (isFullScreen: boolean) => {
    setIsFullScreen(isFullScreen);
  };

  if (!state) {
    return null;
  }

  return (
    <Window
      {...state}
      onChangeState={handleChangeState}
      onToggleFullScreen={handleToggleFullScreen}
    >
      <CardContent className="pt-2 h-full overflow-y-auto">
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
              <img
                className="w-6 h-6 mx-auto"
                src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                alt={coin.name}
              />
              <div className="text-sm truncate">{coin.name}</div>
              <div className="text-sm">{coin.quote.USD.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Window>
  );
};

export default Coin;
