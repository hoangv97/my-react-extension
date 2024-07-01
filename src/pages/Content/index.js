import secrets from 'secrets';
import {
  handleBookPage,
  handleCategoryPage,
  handleCollections,
  handleExplorePage,
  handleReaderPage,
} from './modules/pages/blinkist';
import { handleSearchGoodreads } from './modules/pages/google';
import { handleBookShowPage } from './modules/pages/goodreads';
import { handleChapterPage as handleChapterPageTruyenfull } from './modules/pages/truyenfull';
import { handleChapterPage as handleChapterPageWebnovelpub } from './modules/pages/webnovelpub';

window.addEventListener('load', () => {
  console.log('--------------------Document loaded');

  chrome.storage.sync.get('userConfig', (data) => {
    console.log('User config:', data.userConfig);
  });
});

// Block websites
const blockWebsites = secrets.BLOCK_WEBSITES;
if (blockWebsites && blockWebsites.length) {
  const blockWebsitesRegex = new RegExp(blockWebsites.join('|'), 'i');
  const url = window.location.href;
  if (blockWebsitesRegex.test(url)) {
    const redirectUrlsIfBlocked = secrets.REDIRECT_URLS_IF_BLOCKED;
    if (redirectUrlsIfBlocked && redirectUrlsIfBlocked.length) {
      const randomRedirectUrl =
        redirectUrlsIfBlocked[
          Math.floor(Math.random() * redirectUrlsIfBlocked.length)
        ];
      window.location.href = randomRedirectUrl;
    }
  }
}

const crawlerOn = true;

if (crawlerOn) {
  // Crawl Blinkist
  const href = window.location.href;
  // get params
  const url = new URL(href);
  const searchParams = new URLSearchParams(url.search);

  if (href.includes('blinkist.com')) {
    if (href.endsWith('/app/explore') || href.endsWith('/app/for-you')) {
      setTimeout(handleExplorePage, 3000);
    } else if (href.includes('/en/app/categories/')) {
      setTimeout(handleExplorePage, 3000);
      // setTimeout(handleCategoryPage, 5000);
    } else if (href.includes('/en/app/collections/')) {
      setTimeout(handleCollections, 5000);
    } else if (href.includes('/en/app/books/')) {
      setTimeout(handleBookPage, 5000);
    } else if (href.includes('/en/nc/reader/')) {
      setTimeout(handleReaderPage, 10000);
    }
  } else if (href.includes('google.com/search')) {
    setTimeout(handleSearchGoodreads, 1500);
  } else if (
    href.includes('goodreads.com/book/show') ||
    href.includes('goodreads.com/en/book/show')
  ) {
    setTimeout(handleBookShowPage, 2000);
  } else if (href.includes('truyenfull.vn') && href.includes('chuong-')) {
    setTimeout(handleChapterPageTruyenfull, 2000);
  } else if (href.includes('webnovelpub.pro') && href.includes('/chapter-')) {
    setTimeout(handleChapterPageWebnovelpub, 2000);
  }
}
