import { database_id } from './blinkist';
import { getGoodreadsBooks, getGoogleSearch } from './google';
import { queryDatabase, updatePage } from './notion';
import {
  convertDateString,
  getLocalStorage,
  setLocalStorage,
  sleep,
} from './utils';

const saveNoResultBook = async (book) => {
  await updatePage(book.id, {
    Error: {
      checkbox: true,
    },
  });
};

export const handleBookShowPage = async () => {
  // parse metadata
  const coverImage = document.querySelector(`.BookCover__image img`)?.src;

  if (coverImage) {
    const rating = document.querySelector(
      `.RatingStatistics__rating`
    ).textContent;
    const ratingCount = document
      .querySelector(`.RatingStatistics__meta span[data-testid="ratingsCount"]`)
      .textContent.replace(/\D/g, '');
    const reviewsCount = document
      .querySelector(`.RatingStatistics__meta span[data-testid="reviewsCount"]`)
      .textContent.replace(/\D/g, '');

    const publishDateLabel = document.querySelector(
      `p[data-testid="publicationInfo"]`
    )?.textContent;
    const publishDate = convertDateString(publishDateLabel);

    console.log(
      '-------------> Metadata',
      rating,
      ratingCount,
      reviewsCount,
      publishDate,
      coverImage
    );

    const { results } = await queryDatabase(database_id, {
      and: [
        {
          property: 'Goodreads URL',
          rich_text: {
            equals: window.location.href,
          },
        },
        {
          property: 'GRating',
          number: {
            is_empty: true,
          },
        },
      ],
    });
    if (results.length) {
      const book = results[0];
      console.log('-------------> Updating page', book);
      const properties = {
        GRating: {
          number: parseFloat(rating),
        },
        'GRating Count': {
          number: parseInt(ratingCount),
        },
        'GReviews Count': {
          number: parseInt(reviewsCount),
        },
        Error: {
          checkbox: false,
        },
      };
      if (publishDate) {
        properties['Publish date'] = {
          date: {
            start: publishDate,
          },
        };
      }
      await updatePage(book.id, properties, undefined, undefined, {
        external: { url: coverImage },
      });
    }
  } else {
    // save as error
    const { results } = await queryDatabase(database_id, {
      and: [
        {
          property: 'Goodreads URL',
          rich_text: {
            equals: window.location.href,
          },
        },
        // {
        //   property: 'Error',
        //   checkbox: {
        //     equals: false,
        //   },
        // },
      ],
    });
    if (results.length) {
      const book = results[0];
      console.log('-------------> Saving as error', book);
      await saveNoResultBook(book);
    }
  }

  // go to the next page
  const { results } = await queryDatabase(
    database_id,
    {
      and: [
        {
          property: 'GRating',
          number: {
            is_empty: true,
          },
        },
        {
          property: 'Goodreads URL',
          rich_text: {
            is_not_empty: true,
          },
        },
        // {
        //   property: 'Error',
        //   checkbox: {
        //     equals: true,
        //   },
        // },
      ],
    },
    [{ property: 'Last edited time', direction: 'descending' }]
  );
  const books = results;
  if (books.length) {
    // to goodreads url
    const book = books[Math.floor(Math.random() * books.length)];
    if (book) {
      await sleep(1000);
      window.location.href = book.properties['Goodreads URL'].url;
    }
  } else {
    console.log('------------> No more books to search');
  }
  return;

  if (books.length) {
    console.log('------------> Books to search', books);
    let item;
    do {
      // get random
      const book = books[Math.floor(Math.random() * books.length)];

      // window.location.href = `https://www.google.com/search?q=${encodeURIComponent(
      //   book._q
      // )}`;

      // get search from google api
      const result = await getGoogleSearch(book._q);
      item = result?.items?.find((i) =>
        i.link.includes('goodreads.com/book/show')
      );
      if (item) {
        console.log('------------> Found book', item);
        await updatePage(book.id, {
          'Goodreads URL': {
            url: item.link,
          },
        });
      } else {
        console.log('------------> No result item', book._q);
        await saveNoResultBook(book);
      }
    } while (!item);
    if (item) {
      window.location.href = item.link;
    }
  } else {
    console.log('------------> No more books to search');
  }
};
