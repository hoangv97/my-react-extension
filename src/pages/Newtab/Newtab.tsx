import Carousel from '@/components/common/carousel';
import storage from '@/lib/storage';
import axios from 'axios';
import React from 'react';
import secrets from 'secrets';
import Bookmark from './components/bookmark';
import Coin from './components/coin';
import Settings from './components/settings';
import News from './components/news';
import { ThemeProvider } from '@/components/theme-provider';
import Note from './components/note';
import NewsData from './components/newsdata';
import Mediapipe from './components/mediapipe';
import MindmapContainer from './components/mindmap';
import Draw from './components/draw';
import Camera from './components/camera';
import CodeDemo from './components/codedemo';

const windows = [
  {
    key: 'bookmark',
    component: <Bookmark />,
  },
  {
    key: 'coin',
    component: <Coin />,
  },
  {
    key: 'news',
    component: <News />,
  },
  {
    key: 'newsData',
    component: <NewsData />,
  },
  {
    key: 'note',
    component: <Note />,
  },
  {
    key: 'mediapipe',
    component: <Mediapipe />,
  },
  {
    key: 'mindmap',
    component: <MindmapContainer />,
  },
  {
    key: 'draw',
    component: <Draw />,
  },
  {
    key: 'camera',
    component: <Camera />,
  },
  {
    key: 'codeDemo',
    component: <CodeDemo />,
  },
];

const Newtab = () => {
  const [bgImages, setBgImages] = React.useState<string[]>([]);
  const [hiddenCards, setHiddenCards] = React.useState<string[]>([]);

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

    setHiddenCards(storage.getLocalStorage(storage.KEYS.hiddenCards) || []);
  }, []);

  return (
    <ThemeProvider>
      <div>
        <Settings />
        <div className="w-screen h-screen absolute top-0 left-0 overflow-hidden">
          <Carousel images={bgImages} imageClassName="h-screen" />
        </div>
        <div className="min-w-screen min-h-screen">
          {windows.map((window) => {
            if (hiddenCards.includes(window.key)) {
              return null;
            }
            // add key prop
            if (window.component) {
              window.component = React.cloneElement(window.component, {
                key: window.key,
              });
            }
            return window.component;
          })}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Newtab;
