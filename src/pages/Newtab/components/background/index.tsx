import Carousel from '@/components/common/carousel';
import storage from '@/lib/storage';
import axios from 'axios';
import React from 'react';
import secrets from 'secrets';

export default function Background() {
  const [bgImages, setBgImages] = React.useState<string[]>([]);

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
    <div className="w-screen h-screen absolute top-0 left-0 overflow-hidden">
      <Carousel images={bgImages} imageClassName="h-screen" />
    </div>
  );
}
