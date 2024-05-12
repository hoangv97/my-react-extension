import {
  queryDatabase,
  createPage,
  updatePage,
  appendBlockChildren,
  getBlockChildren,
} from './notion';

const database_id = 'b34b292f67134f01b7b4f05ad848a423';
const SAVED_BOOKS_KEY = '____saved_books';
const BOOKS_KEY = '____books';
const ERROR_BOOKS_KEY = '____error_books';
const clickButtonTimeoutInReaderPage = 3000;

const sleep = (m) => new Promise((r) => setTimeout(r, m));

const getLocalStorage = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};
const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
const getBookLinkPath = (bookLink) => {
  const arr = bookLink.split('/');
  return arr[arr.length - 1];
};
const clearCurrentBookLinkFromLocalStorage = () => {
  const currentBookLink = getBookLinkPath(window.location.href);
  const storedBooks = getLocalStorage(BOOKS_KEY) || [];
  const newBooks = storedBooks.filter((b) => b !== currentBookLink);
  setLocalStorage(BOOKS_KEY, newBooks);

  const savedBooks = getLocalStorage(SAVED_BOOKS_KEY) || [];
  if (!savedBooks.includes(currentBookLink)) {
    savedBooks.push(currentBookLink);
    setLocalStorage(SAVED_BOOKS_KEY, savedBooks);
  }
};
const popBookLinkFromLocalStorage = () => {
  const storedBooks = getLocalStorage(BOOKS_KEY) || [];
  if (!storedBooks.length) {
    console.log('No more book links to process');
    return;
  }
  // get random book link
  const bookLink = storedBooks[Math.floor(Math.random() * storedBooks.length)];
  window.location.href = `https://www.blinkist.com/en/app/books/${bookLink}`;
};
const saveBookLinksInPage = () => {
  const books = document.querySelectorAll(`a[href*='/en/app/books/']`);
  const bookLinks = Array.from(books).map((b) => b.href);
  const storedBooks = getLocalStorage(BOOKS_KEY) || [];
  const savedBooks = getLocalStorage(SAVED_BOOKS_KEY) || [];
  const newBooks = bookLinks
    .map(getBookLinkPath)
    .filter((b) => !storedBooks.includes(b))
    .filter((b) => !savedBooks.includes(b));
  if (newBooks.length) {
    newBooks.forEach((b) => {
      storedBooks.push(b);
    });
    setLocalStorage(BOOKS_KEY, storedBooks);
  }
};
const findPage = async (title, author) => {
  const { results } = await queryDatabase(database_id, {
    and: [
      {
        property: 'Title',
        rich_text: {
          equals: title,
        },
      },
      {
        property: 'Author',
        rich_text: {
          equals: author,
        },
      },
    ],
  });
  return results;
};

export const handleExplorePage = async () => {
  // update saved books from notion
  let start_cursor = undefined;
  const savedBooks = getLocalStorage(SAVED_BOOKS_KEY) || [];
  do {
    const { results, next_cursor } = await queryDatabase(
      database_id,
      undefined,
      undefined,
      start_cursor
    );
    start_cursor = next_cursor;
    const books = results.map((r) => getBookLinkPath(r.properties.URL.url));
    books.forEach((b) => {
      if (!savedBooks.includes(b)) {
        savedBooks.push(b);
      }
    });
  } while (start_cursor);
  setLocalStorage(SAVED_BOOKS_KEY, savedBooks);
  console.log('Saved books:', savedBooks);

  // update books from saved books
  const storedBooks = getLocalStorage(BOOKS_KEY) || [];
  const newBooks = storedBooks.filter((b) => !savedBooks.includes(b));
  setLocalStorage(BOOKS_KEY, newBooks);
  console.log('New books:', newBooks);

  const categories = document.querySelectorAll(`a[href*='/en/app/categories']`);
  const p = prompt(
    `${Array.from(categories)
      .map((c, i) => `${i + 1}: ${c.textContent}`)
      .join('; ')}`
  );
  if (p) {
    Array.from(categories)[p - 1].click();
  }
};

export const handleCategoryPage = () => {
  saveBookLinksInPage();
  popBookLinkFromLocalStorage();
};

export const handleBookPage = async () => {
  // Save book metadata
  const title = document.querySelector(
    `h1[data-test-id="book-title"]`
  ).textContent;
  const author = document
    .querySelector(`h1[data-test-id="book-title"]`)
    .parentElement.querySelector('h2').textContent;
  const subtitle = document
    .querySelector(`h1[data-test-id="book-title"]`)
    .parentElement.querySelector('p').textContent;
  const categories = Array.from(
    document.querySelectorAll(`a[href*='/en/app/categories/']`)
  ).map((c) => c.textContent);
  const description = document.querySelector('.mb-8.mx-4 p').textContent;

  const properties = {
    Title: {
      title: [
        {
          text: {
            content: title,
          },
        },
      ],
    },
    Author: {
      rich_text: [
        {
          text: {
            content: author,
          },
        },
      ],
    },
    Subtitle: {
      rich_text: [
        {
          text: {
            content: subtitle,
          },
        },
      ],
    },
    Description: {
      rich_text: [
        {
          text: {
            content: description,
          },
        },
      ],
    },
    Categories: {
      multi_select: categories.map((c) => ({
        name: c,
      })),
    },
    URL: {
      url: window.location.href,
    },
  };

  const pages = await findPage(title, author);
  if (pages.length === 0) {
    console.log('-----------> Creating new page', title, author);
    await createPage(database_id, properties, []);
  } else {
    const page = pages[0];
    console.log('-----------> Updating existing page', title, author);
    await updatePage(page.id, properties);
  }

  saveBookLinksInPage();

  const readButton = document.querySelector(`a[data-test-id="read-button"]`);
  if (readButton) {
    readButton.click();
  } else {
    console.log('-----------> No read button found');
  }
};

export const handleReaderPage = async () => {
  const title = document
    .querySelector('.reader-chapter-indicator__title')
    .textContent.trim();
  const author = document
    .querySelector('.reader-chapter-indicator__author')
    .textContent.slice(3)
    .trim();

  const pages = await findPage(title, author);
  let currentChildren = [];
  let page = null;
  if (pages.length) {
    page = pages[0];
    currentChildren = await getBlockChildren(page.id);
    if (currentChildren.length) {
      console.log('-----------> Page already has content', title, author);
      clearCurrentBookLinkFromLocalStorage();
      popBookLinkFromLocalStorage();
      return;
    }
  }

  while (
    document.querySelector('.reader-content__previous').style.display !== 'none'
  ) {
    document.querySelector('.reader-content__previous').click();
    await sleep(clickButtonTimeoutInReaderPage);
  }

  const data = [];

  const getContent = async () => {
    data.push({
      sub: document
        .querySelector('.reader-content h5.text-mid-grey')
        ?.textContent.trim(),
      headline: document
        .querySelector('.reader-content__headline')
        .textContent.trim(),
      content: Array.from(document.querySelectorAll('.reader-content__text p'))
        .map((p) => p.textContent.trim())
        .filter((p) => !!p),
    });

    if (
      document.querySelector('.reader-content__next').style.display !== 'none'
    ) {
      document.querySelector('.reader-content__next').click();
      await sleep(clickButtonTimeoutInReaderPage);
      await getContent();
    }
  };

  await getContent();

  if (!data.length) {
    // save to error log
    const errorBooks = getLocalStorage(ERROR_BOOKS_KEY) || [];
    if (!errorBooks.includes(window.location.href)) {
      errorBooks.push(window.location.href);
      setLocalStorage(ERROR_BOOKS_KEY, errorBooks);
    }
  } else {
    const children = data
      .map((d) =>
        [
          d.sub
            ? {
                object: 'block',
                type: 'heading_3',
                heading_3: {
                  rich_text: [
                    {
                      type: 'text',
                      text: {
                        content: d.sub,
                      },
                    },
                  ],
                },
              }
            : null,
          {
            object: 'block',
            type: 'heading_1',
            heading_1: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: d.headline,
                  },
                },
              ],
            },
          },
          ...d.content.map((c) => ({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: c,
                  },
                },
              ],
            },
          })),
        ].filter((b) => b)
      )
      .flat();

    if (pages.length === 0) {
      console.log('-----------> Creating new page', title, author);
      await createPage(
        database_id,
        {
          Title: {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
          Author: {
            rich_text: [
              {
                text: {
                  content: author,
                },
              },
            ],
          },
        },
        children
      );
    } else {
      if (!currentChildren.length) {
        console.log(
          '-----------> Updating existing page',
          title,
          author,
          children
        );
        await appendBlockChildren(page?.id, children);
      } else {
        console.log('-----------> Page already has content', title, author);
      }
    }

    clearCurrentBookLinkFromLocalStorage();
  }

  popBookLinkFromLocalStorage();
};
