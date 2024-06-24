import {
  queryDatabase,
  createPage,
  updatePage,
  appendBlockChildren,
  getBlockChildren,
} from '../notion';
import { getLocalStorage, setLocalStorage, sleep } from '../utils';

export const database_id = 'b34b292f67134f01b7b4f05ad848a423';
export const collection_database_id = '747905a05c124de9bfe9d1627f741703';
const SAVED_BOOKS_KEY = '____saved_books';
const BOOKS_KEY = '____books';
const COLLECTIONS_KEY = '____collections';
const clickButtonTimeoutInReaderPage = 3000;

const getBookLinkPath = (bookLink) => {
  const arr = bookLink.split('/');
  return arr[arr.length - 1];
};
const setCurrentBookLinkAsSaved = () => {
  const currentBookLink = getBookLinkPath(window.location.href);
  const savedBooks = getLocalStorage(SAVED_BOOKS_KEY) || [];
  if (!savedBooks.includes(currentBookLink)) {
    savedBooks.push(currentBookLink);
    setLocalStorage(SAVED_BOOKS_KEY, savedBooks);
  }
};
const popBookLinkFromLocalStorage = () => {
  return;
  const storedBooks = getLocalStorage(BOOKS_KEY) || [];
  if (!storedBooks.length) {
    console.log('No more book links to process');
    return;
  }
  // get random book link
  const bookLink = storedBooks[Math.floor(Math.random() * storedBooks.length)];

  // remove book link from stored books
  const newBooks = storedBooks.filter((b) => b !== bookLink);
  setLocalStorage(BOOKS_KEY, newBooks);

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
const goToQueuedCollection = (isNewTab = false) => {
  const storedCollections = getLocalStorage(COLLECTIONS_KEY) || [];
  if (!storedCollections.length) {
    console.log('-----------------> No more collection links to process');
    return;
  }
  // get random collection link
  const collectionLink =
    storedCollections[Math.floor(Math.random() * storedCollections.length)];
  if (isNewTab) {
    window.open(collectionLink, '_blank');
  } else {
    window.location.href = collectionLink;
  }
};
const addToQueuedCollections = (urls) => {
  const storedCollections = getLocalStorage(COLLECTIONS_KEY) || [];
  urls.forEach((u) => {
    if (!storedCollections.includes(u)) {
      storedCollections.push(u);
    }
  });
  setLocalStorage(COLLECTIONS_KEY, storedCollections);
};
const removeCollectionFromQueued = (url) => {
  const storedCollections = getLocalStorage(COLLECTIONS_KEY) || [];
  const newCollections = storedCollections.filter((c) => c !== url);
  setLocalStorage(COLLECTIONS_KEY, newCollections);
};

export const handleExplorePage = async () => {
  // get new books and check if they are already saved
  const books = document.querySelectorAll(`a[href*='/en/app/books/']`);
  let bookLinks = Array.from(books)
    .map((b) => b.href.split('?')[0])
    .filter((b) => !b.endsWith('-de'));
  bookLinks = Array.from(new Set(bookLinks));
  const { results: notionBooks } = await queryDatabase(database_id, {
    or: bookLinks.map((b) => ({
      property: 'URL',
      url: {
        equals: b,
      },
    })),
  });
  const notionBookLinks = notionBooks.map((b) => b.properties.URL.url);
  const missingBookLinks = bookLinks.filter(
    (b) => !notionBookLinks.includes(b)
  );
  console.log('---------------> Book links:', bookLinks, notionBookLinks);
  console.log('---------------> New Books:', missingBookLinks);
  for (const link of missingBookLinks) {
    window.open(link, '_blank');
  }

  // get new collections and check if they are already saved
  const collections = document.querySelectorAll(
    `a[href*='/en/app/collections/']`
  );
  const collectionLinks = Array.from(collections).map((c) => c.href);
  const { results: notionCollections } = await queryDatabase(
    collection_database_id,
    {
      or: collectionLinks.map((b) => ({
        property: 'URL',
        url: {
          equals: b,
        },
      })),
    }
  );
  const notionCollectionLinks = notionCollections.map(
    (c) => c.properties.URL.url
  );
  const missingCollectionsLinks = collectionLinks.filter(
    (b) => !notionCollectionLinks.includes(b)
  );
  console.log(
    '---------------> Collection links:',
    collectionLinks,
    notionCollectionLinks
  );
  console.log('---------------> New Collections:', missingCollectionsLinks);
  addToQueuedCollections(missingCollectionsLinks);
  goToQueuedCollection(true);

  return;

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

export const handleCollections = async () => {
  const books = document
    .querySelector('section[data-test-id="collection-items-section"]')
    .querySelectorAll(`a[href*='/en/app/books/']`);
  let bookLinks = Array.from(books)
    .map((b) => b.href.split('?')[0])
    .filter((b) => !b.endsWith('-de'));
  bookLinks = Array.from(new Set(bookLinks));

  if (!bookLinks.length) {
    console.log('---------------> No books found in collection');
    removeCollectionFromQueued(window.location.href);
    goToQueuedCollection();
    return;
  }

  let notionPage;
  let hasMissingBooks = false;

  // check exist in notion
  const { results } = await queryDatabase(collection_database_id, {
    and: [
      {
        property: 'URL',
        url: {
          equals: window.location.href,
        },
      },
    ],
  });
  if (results.length) {
    console.log('---------------> Collection already saved:', results);
    notionPage = results[0];
  } else {
    const title = document.querySelector(
      'section[data-test-id="collection-items-section"] h2'
    ).textContent;
    const subtitle = document.querySelector(
      'section[data-test-id="collection-items-section"] .text-dark-grey'
    ).textContent;
    const description = document.querySelector(
      'div[data-test-id="about-section"] p'
    ).textContent;
    const categories = Array.from(
      document
        .querySelector('div[data-test-id="about-section"]')
        .querySelectorAll(`a[href*='/en/app/categories/']`)
    ).map((c) => c.textContent);

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
    notionPage = await createPage(
      { database_id: collection_database_id },
      properties,
      []
    );
    console.log('---------------> Create new collection:', notionPage);
  }

  const { results: children } = await getBlockChildren(notionPage.id);
  if (children.length) {
    console.log('---------------> Collection already has content:', children);
  } else {
    // get notion ids of books
    const { results } = await queryDatabase(database_id, {
      or: bookLinks.map((b) => ({
        property: 'URL',
        url: {
          equals: b,
        },
      })),
    });
    console.log('---------------> Book links:', bookLinks, results);
    if (results.length !== bookLinks.length) {
      // find missing books
      const missingBookLinks = bookLinks.filter(
        (b) => !results.map((r) => r.properties.URL.url).includes(b)
      );
      console.log('---------------> Missing books:', missingBookLinks);
      hasMissingBooks = missingBookLinks.length > 0;
      for (const link of missingBookLinks) {
        if (link.endsWith('-de')) {
          continue;
        }
        window.open(link, '_blank');
      }
    } else {
      const bookIds = results.map((r) => r.id);
      const children = bookIds.map((b) => ({
        object: 'block',
        type: 'link_to_page',
        link_to_page: { page_id: b },
      }));
      await appendBlockChildren(notionPage.id, children);
      console.log('---------------> add children to collection:', children);
    }
  }

  // go to next collection
  const otherCollections = document.querySelectorAll(
    `a[href*='/en/app/collections/']`
  );
  const otherCollectionsLinks = Array.from(otherCollections).map((b) => b.href);

  // check links in notion
  const { results: notionCollections } = await queryDatabase(
    collection_database_id,
    {
      or: otherCollectionsLinks.map((b) => ({
        property: 'URL',
        url: {
          equals: b,
        },
      })),
    }
  );
  const notionCollectionLinks = notionCollections.map(
    (c) => c.properties.URL.url
  );
  const missingCollectionsLinks = otherCollectionsLinks.filter(
    (b) => !notionCollectionLinks.includes(b)
  );
  console.log(
    '---------------> missingCollectionsLinks:',
    missingCollectionsLinks
  );

  if (!hasMissingBooks) {
    removeCollectionFromQueued(window.location.href);
  }
  addToQueuedCollections(missingCollectionsLinks);
  goToQueuedCollection();
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
    await createPage({ database_id }, properties, []);
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
    const { results } = await getBlockChildren(page.id);
    currentChildren = results;
    if (currentChildren.length) {
      console.log('-----------> Page already has content', title, author);
      setCurrentBookLinkAsSaved();
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
    // push back to the end of the queue
    const storedBooks = getLocalStorage(BOOKS_KEY) || [];
    storedBooks.push(getBookLinkPath(window.location.href));
    setLocalStorage(BOOKS_KEY, storedBooks);
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
        { database_id },
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

    setCurrentBookLinkAsSaved();
  }

  popBookLinkFromLocalStorage();

  await sleep(1000);
  // auto close tab
  window.close();
};
