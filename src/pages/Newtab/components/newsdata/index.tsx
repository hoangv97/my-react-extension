import Window from '@/components/common/window';
import { CardContent } from '@/components/ui/card';
import storage from '@/lib/storage';
import axios from 'axios';
import React from 'react';
import secrets from 'secrets';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { GearIcon } from '@radix-ui/react-icons';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  'business',
  'crime',
  'domestic',
  'education',
  'entertainment',
  'environment',
  'food',
  'health',
  'other',
  'politics',
  'science',
  'sports',
  'technology',
  'top',
  'tourism',
  'world',
];
const COUNTRIES = ['us', 'gb', 'cn', 'vi'];
const LANGUAGES = ['en', 'vi', 'jp', 'zh'];

const maxSelected = 5;

const cacheKey = storage.KEYS.newsDataArticles;
const cacheTimeout = 1000 * 60 * 60;

const NewsData = () => {
  const [state, setState] = React.useState<any>();
  const [articles, setArticles] = React.useState<any[]>(
    storage.getLocalStorage(storage.KEYS.newsDataArticles, [])
  );
  const [categories, setCategories] = React.useState<any[]>(
    storage.getLocalStorage(storage.KEYS.newsDataCategories, [])
  );
  const [countries, setCountries] = React.useState<any[]>(
    storage.getLocalStorage(storage.KEYS.newsDataCountries, [])
  );
  const [languages, setLanguages] = React.useState<any[]>(
    storage.getLocalStorage(storage.KEYS.newsDataLanguages, [])
  );
  const [showSettings, setShowSettings] = React.useState(false);
  const [nextPage, setNextPage] = React.useState('');
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const fetchNews = async (page?: string) => {
    let country = countries.length > 0 ? countries.join(',') : undefined;
    const language = languages.length > 0 ? languages.join(',') : undefined;
    const category = categories.length > 0 ? categories.join(',') : undefined;
    if (!country && !language && !category) {
      country = 'us';
    }
    const res = await axios.get(`https://newsdata.io/api/1/news`, {
      params: {
        apiKey: secrets.NEWSDATA_API_KEY,
        country,
        language,
        category,
        image: 1,
        page,
      },
    });
    return res;
  };

  React.useEffect(() => {
    const state = storage.getLocalStorage(storage.KEYS.newsDataWindowRndState);
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

    const init = async () => {
      const result = storage.getLocalStorage(cacheKey);
      if (result) {
        setArticles(result.results);
        setNextPage(result.nextPage);
      } else {
        const res = await fetchNews();
        setArticles(res.data.results);
        setNextPage(res.data.nextPage);
        storage.setLocalStorage(cacheKey, res.data, cacheTimeout);
      }
    };

    init();
  }, []);

  const handleScroll = (e: any) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    console.log('bottom', bottom);

    if (bottom) {
      const fetchMore = async () => {
        const res = await fetchNews(nextPage);
        setNextPage(res.data.nextPage);
        setArticles((prev) => [...prev, ...res.data.results]);
        storage.setLocalStorage(
          cacheKey,
          {
            ...res.data,
            results: [...articles, ...res.data.results],
            nextPage: res.data.nextPage,
          },
          cacheTimeout
        );
      };
      fetchMore();
    }
  };

  const handleChangeState = (state: any) => {
    storage.setLocalStorage(storage.KEYS.newsDataWindowRndState, state);
  };

  const handleToggleFullScreen = (isFullScreen: boolean) => {
    setIsFullScreen(isFullScreen);
  };

  const windowSubButtons = () => {
    return (
      <GearIcon
        className="cursor-pointer"
        onClick={() => {
          setShowSettings(!showSettings);
        }}
      />
    );
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
      subButtons={windowSubButtons()}
    >
      <CardContent className="pt-2 h-full">
        <ScrollArea className="h-full" onScroll={handleScroll}>
          <div className={`flex flex-col gap-2`}>
            {showSettings && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-4 items-center">
                  <div className="text-lg font-bold">Categories</div>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={categories.includes(item)}
                          onCheckedChange={(checked) => {
                            if (checked && categories.length < maxSelected) {
                              setCategories((prev) => [...prev, item]);
                            } else {
                              setCategories((prev) =>
                                prev.filter((c) => c !== item)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={item}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-lg font-bold">Countries</div>
                  <div className="flex flex-wrap gap-3">
                    {COUNTRIES.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={countries.includes(item)}
                          onCheckedChange={(checked) => {
                            if (checked && countries.length < maxSelected) {
                              setCountries((prev) => [...prev, item]);
                            } else {
                              setCountries((prev) =>
                                prev.filter((c) => c !== item)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={item}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-lg font-bold">Languages</div>
                  <div className="flex flex-wrap gap-3">
                    {LANGUAGES.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={languages.includes(item)}
                          onCheckedChange={(checked) => {
                            if (checked && languages.length < maxSelected) {
                              setLanguages((prev) => [...prev, item]);
                            } else {
                              setLanguages((prev) =>
                                prev.filter((c) => c !== item)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={item}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Button
                    size="sm"
                    onClick={() => {
                      storage.setLocalStorage(
                        storage.KEYS.newsDataCategories,
                        categories
                      );
                      storage.setLocalStorage(
                        storage.KEYS.newsDataCountries,
                        countries
                      );
                      storage.setLocalStorage(
                        storage.KEYS.newsDataLanguages,
                        languages
                      );
                      storage.removeLocalStorage(storage.KEYS.newsDataArticles);
                      setShowSettings(false);
                    }}
                  >
                    Save settings
                  </Button>
                </div>
                <Separator />
              </div>
            )}
            <div className="flex flex-col gap-2">
              {(articles || []).map((article) => {
                return (
                  <div key={article.article_id} className="flex gap-2">
                    <div className="w-16">
                      <img
                        src={article.image_url}
                        alt=""
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex-1">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-700 dark:text-gray-300 font-bold mb-2"
                      >
                        {article.title}
                      </a>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="text-gray-700 dark:text-gray-400 text-sm"
                              dangerouslySetInnerHTML={{
                                __html: article.description.replaceAll(
                                  '\n',
                                  '<br />'
                                ),
                              }}
                            ></div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-md">{article.content}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Window>
  );
};

export default NewsData;
