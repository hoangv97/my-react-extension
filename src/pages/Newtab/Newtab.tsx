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
          {hiddenCards.includes('bookmark') ? null : <Bookmark />}
          {hiddenCards.includes('coin') ? null : <Coin />}
          {hiddenCards.includes('news') ? null : <News />}
          {hiddenCards.includes('newsData') ? null : <NewsData />}
          {hiddenCards.includes('note') ? null : <Note />}
          {hiddenCards.includes('mediapipe') ? null : <Mediapipe />}
          {hiddenCards.includes('mindmap') ? null : <MindmapContainer />}
          {hiddenCards.includes('draw') ? null : <Draw />}
          {hiddenCards.includes('camera') ? null : <Camera />}
          {hiddenCards.includes('codeDemo') ? null : <CodeDemo />}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Newtab;
