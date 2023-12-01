import Carousel from '@/components/common/carousel';
import storage from '@/lib/storage';
import axios from 'axios';
import React from 'react';
import secrets from 'secrets';
import Bookmark from './components/bookmark';
import Coin from './components/coin';
import Settings from './components/settings';
import News from './components/news';

const Newtab = () => {
  const [bgImages, setBgImages] = React.useState<string[]>([]);

  React.useEffect(() => {
    const setupBg = (res: any) => {
      setBgImages(
        res
          .map((d: any) => {
            d._url = d.urls.regular;
            d._download_url = `${d.links.download}?force=true`;
            return d;
          })
          .map((d: any) => d._url)
      );
    };

    const fetchBgImages = async () => {
      const cacheKey = storage.KEYS.bgImages;
      const cacheTimeout = 1000 * 60;
      const result = storage.getLocalStorage(cacheKey);
      if (result) {
        setupBg(result);
      } else {
        const res = await axios.get('https://api.unsplash.com/photos/random', {
          params: {
            client_id: secrets.UNSPLASH_ID,
            count: 3,
            orientation: 'landscape',
          },
        });
        setupBg(res.data);
        storage.setLocalStorage(cacheKey, res.data, cacheTimeout);
      }
    };
    fetchBgImages();
  }, []);

  return (
    <div>
      <Settings />
      <div className="w-screen h-screen absolute top-0 left-0 overflow-hidden">
        <Carousel images={bgImages} imageClassName="h-screen" />
      </div>
      <div className="min-w-screen min-h-screen">
        <Bookmark />
        <Coin />
        <News />
      </div>
    </div>
  );
};

export default Newtab;
