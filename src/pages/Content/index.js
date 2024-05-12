import {
  handleBookPage,
  handleCategoryPage,
  handleExplorePage,
  handleReaderPage,
} from './modules/blinkist';
import secrets from 'secrets';

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

// Crawl Blinkist
if (window.location.href.includes('blinkist.com')) {
  const href = window.location.href;

  if (href.endsWith('/app/explore')) {
    setTimeout(handleExplorePage, 3000);
  } else if (href.includes('/en/app/categories/')) {
    setTimeout(handleCategoryPage, 5000);
  } else if (href.includes('/en/app/books/')) {
    setTimeout(handleBookPage, 5000);
  } else if (href.includes('/en/nc/reader/')) {
    setTimeout(handleReaderPage, 10000);
  }
}
