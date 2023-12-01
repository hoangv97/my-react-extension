import Window from '@/components/common/window';
import { CardContent } from '@/components/ui/card';
import storage from '@/lib/storage';
import axios from 'axios';
import React from 'react';
import secrets from 'secrets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [state, setState] = React.useState<any>();
  const [categories, setCategories] = React.useState<any[]>(
    NEWSAPI_CATEGORIES.map((c) => ({ name: c, articles: [] }))
  );
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  React.useEffect(() => {
    const state = storage.getLocalStorage(storage.KEYS.newsWindowRndState);
    if (state) {
      setState(state);
    } else {
      setState({
        x: 5,
        y: 5,
        width: 750,
        height: 600,
      });
    }

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

  const handleChangeState = (state: any) => {
    storage.setLocalStorage(storage.KEYS.newsWindowRndState, state);
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
      cardOpacity={0.85}
    >
      <CardContent className="pt-2 h-full overflow-y-auto">
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
      </CardContent>
    </Window>
  );
};

export default News;
