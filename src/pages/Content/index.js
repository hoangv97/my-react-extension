import { printLine } from './modules/print';
import secrets from 'secrets';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

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
