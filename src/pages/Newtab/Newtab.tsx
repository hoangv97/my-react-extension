import Carousel from '@/components/common/carousel';
import { ThemeProvider } from '@/components/theme-provider';
import storage from '@/lib/storage';
import axios from 'axios';
import React, { Fragment } from 'react';
import secrets from 'secrets';
import { shallow } from 'zustand/shallow';
import Settings from './components/settings';
import useStore from './store';
import { selector } from './store/window';

const Newtab = () => {
  const [bgImages, setBgImages] = React.useState<string[]>([]);

  const { windowList } = useStore(selector, shallow);

  React.useEffect(() => {
    const setupBg = (res: any) => {
      // shuffle
      res.sort(() => Math.random() - 0.5);
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
            count: 5,
            orientation: 'landscape',
          },
        });
        if (res.status !== 200) {
          return;
        }
        setupBg(res.data);
        storage.setLocalStorage(cacheKey, res.data, cacheTimeout);
      }
    };
    fetchBgImages();
  }, []);

  return (
    <ThemeProvider>
      <div>
        <Settings />
        <div className="w-screen h-screen absolute top-0 left-0 overflow-hidden">
          <Carousel images={bgImages} imageClassName="h-screen" />
        </div>
        <div className="min-w-screen min-h-screen">
          {windowList
            .filter(({ active }) => active)
            .map((window) => {
              // add key prop to react node to avoid react warning
              return <Fragment key={window.key}>{window.component}</Fragment>;
            })}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Newtab;
