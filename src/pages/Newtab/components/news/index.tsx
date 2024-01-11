import Window from '@/components/common/window';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import storage from '@/lib/storage';
import { useWindowState } from '@/pages/Newtab/hooks/useWindowState';
import axios from 'axios';
import React from 'react';
import secrets from 'secrets';

const NEWSAPI_CATEGORIES = [
  'general',
  'business',
  'technology',
  'entertainment',
  'health',
  'science',
  'sports',
];
const NEWSAPI_COUNTRY = 'us';
const NEWSAPI_LANGUAGE = 'en';

const News = () => {
  const [categories, setCategories] = React.useState<any[]>(
    NEWSAPI_CATEGORIES.map((c) => ({ name: c, articles: [] }))
  );
  const {
    state,
    isFullScreen,
    handleChangeState,
    handleToggleFullScreen,
    handleClose,
  } = useWindowState('news');

  React.useEffect(() => {
    const fetchNews = async () => {
      const cacheKey = storage.KEYS.newsTopHeadlines;
      const cacheTimeout = 1000 * 60 * 60;
      const result = storage.getLocalStorage(cacheKey);
      if (result) {
        setCategories(result);
      } else {
        const newsPromises = NEWSAPI_CATEGORIES.map(async (category) => {
          const res = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
              country: NEWSAPI_COUNTRY,
              apiKey: secrets.NEWS_API_KEY,
              category,
            },
          });
          return res;
        });
        const results = await Promise.all(newsPromises);
        // console.log(results);
        const newCategories = NEWSAPI_CATEGORIES.map((c, i) => ({
          name: c,
          articles: results[i].data.articles.filter(
            (article: any) => article.content !== '[Removed]'
          ),
        }));
        setCategories(newCategories);
        storage.setLocalStorage(cacheKey, newCategories, cacheTimeout);
      }
    };

    fetchNews();
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
      cardOpacity={0.85}
    >
      <ScrollArea className="h-full">
        <div
          className={`flex w-full ${
            isFullScreen ? 'flex-wrap gap-4' : 'overflow-hidden gap-2'
          }`}
        >
          <Tabs defaultValue={NEWSAPI_CATEGORIES[0]}>
            <TabsList className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <TabsTrigger key={category.name} value={category.name}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent
                key={category.name}
                value={category.name}
                className="flex flex-col gap-2"
              >
                {category.articles.map((article: any) => (
                  <div key={article.url} className="flex gap-2">
                    <div className="w-16">
                      <img
                        src={article.urlToImage}
                        alt=""
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex-1">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-700 dark:text-gray-300 font-bold mb-2"
                      >
                        {article.title}
                      </a>
                      <div className="text-gray-700 dark:text-gray-400 text-sm">
                        {article.description}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </ScrollArea>
    </Window>
  );
};

export default News;
