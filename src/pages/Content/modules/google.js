import { fetchApiWithRetry } from './api';
import secrets from 'secrets';
import { queryDatabase, updatePage } from './notion';
import { database_id } from './blinkist';
import { getLocalStorage, setLocalStorage, sleep } from './utils';

const googleApi = `https://customsearch.googleapis.com/customsearch/v1`;

export const getGoogleSearch = async (q) => {
  const result = await fetchApiWithRetry(
    `${googleApi}?q=${q}&key=${secrets.GOOGLE_API_KEY}&cx=${secrets.GOOGLE_CSE_ID}`
  );
  return result;
};

const BOOKS_KEY = '__________books';

export const getGoodreadsBooks = async (pFilter = []) => {
  const result = await queryDatabase(
    database_id,
    {
      and: [
        {
          property: 'Goodreads URL',
          rich_text: {
            is_empty: true,
          },
        },
        ...pFilter,
      ],
    },
    [{ property: 'Created time', direction: 'ascending' }]
  );
  const newBooks = result.results.map((b) => ({
    ...b,
    _q: `${b.properties.Title.title[0].text.content} ${b.properties.Author.rich_text[0].text.content} site:goodreads.com`,
  }));
  return newBooks;
};

export const handleSearchGoodreads = async () => {
  // get books with no goodreads link
  const { results } = await queryDatabase(database_id, {
    and: [
      {
        property: 'Goodreads URL',
        rich_text: {
          is_empty: true,
        },
      },
      // {
      //   property: 'Error',
      //   checkbox: {
      //     equals: true,
      //   },
      // },
    ],
  });
  console.log('------------> Books', results);
  if (!results.length) {
    return;
  }

  // get books with no goodreads link
  let books = results.map((b) => ({
    ...b,
    _q: `${b.properties.Title.title[0].text.content} ${b.properties.Author.rich_text[0].text.content} site:goodreads.com`,
  }));

  let a = document.querySelector(`a[href*='goodreads.com/book']`);
  if (!a) {
    a = document.querySelector(`a[href*='goodreads.com/en/book']`);
  }
  const _q = document.querySelector(`textarea`).value;
  if (a) {
    const book = books.find((b) => b._q === _q);

    if (book) {
      console.log('------------------> Found book', book, a.href);
      await updatePage(book.id, {
        'Goodreads URL': {
          url: a.href,
        },
      });
      // books = books.filter((b) => b.id !== book.id);
      // setLocalStorage(BOOKS_KEY, books);

      // // go to goodreads page
      // window.location.href = a.href;
      // return;
    }
  } else if (document.querySelector(`#recaptcha`)) {
    await sleep(1000000);
  }

  // go to the next page
  // if (books.length > 50 && books.length < 500) {
  //   const newBooks = await getGoodreadsBooks();
  //   books = [...books, ...newBooks];
  //   console.log('------------> Books to search', books);
  // }

  // setLocalStorage(BOOKS_KEY, books);

  if (books.length) {
    // get random book
    const book = books[Math.floor(Math.random() * books.length)];
    // sleep random
    await sleep(1000 + Math.random() * 2000);
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(
      book._q
    )}`;
  }
};
