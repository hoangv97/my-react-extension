import {
  countPromptTokens,
  summaryChapter,
  summaryChapterSummaries,
} from '../summarizer';
import {
  createDatabase,
  createPage,
  getAllBlockChildren,
  getBlockChildren,
  queryDatabase,
  splitParagraphs,
} from '../notion';

export const handleChapterPage = async () => {
  // Config
  const maxTokens = 5000;
  const autoNextPage = true;
  const summaryChapterSummariesOutputSentencesNum = 20;
  const summaryChapterOutputSentencesNum = 5;

  // parse data from current page
  document.querySelectorAll('#chapter-c div').forEach((e) => e.remove());
  document.querySelectorAll('#chapter-c a').forEach((e) => e.remove());
  const innerHtml = document.querySelector('#chapter-c').innerHTML;
  const chapterContent = innerHtml
    .replace(/<br>/g, '\n')
    .replace(/<[^>]*>/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();
  const chapterTitle = document.querySelector('.chapter-title').textContent;
  const novelTitle = document.querySelector('.truyen-title').textContent;
  console.log({
    chapterTitle,
    novelTitle,
    chapterContent,
  });

  // get notion pages
  const mainNotionPageId = '6d6b78342de0426c9af57ba2b065b2ea';

  const databases = await getAllBlockChildren(mainNotionPageId);
  let database = databases.find(
    (p) => p.type === 'child_database' && p.child_database.title === novelTitle
  );
  if (!database) {
    database = await createDatabase(mainNotionPageId, novelTitle, {
      Name: {
        title: {},
      },
      URL: {
        url: {},
      },
      'Last edited time': {
        last_edited_time: {},
      },
      'Created time': {
        created_time: {},
      },
    });
  }
  console.log('Current page:', database);
  if (!database) {
    return;
  }

  // get latest group summary + previous chapter summaries
  const { results: chapters } = await queryDatabase(database.id, undefined, [
    {
      property: 'Last edited time',
      direction: 'descending',
    },
  ]);
  console.log('Current chapters:', chapters);
  const currentChapters = [];
  let currentChapterNumber = 1;

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const { id, properties } = chapter;
    const name = properties.Name.title[0].text.content;

    if (name.endsWith(chapterTitle)) {
      console.log('Chapter already exists:', name);

      // move to next chapter
      if (autoNextPage) {
        document.querySelector('#next_chap').click();
        return;
      }
    }

    if (i === 0) {
      // get number of current chapter from name C1 - Chapter 1
      const match = name.match(/C(\d+)/);
      if (match) {
        currentChapterNumber = parseInt(match[1]) + 1;
        console.log('Current chapter number:', currentChapterNumber);
      }
    }

    // const children = await getAllBlockChildren(id);
    const { results: children } = await getBlockChildren(id);
    const chapterContent = [];
    const chapterSummary = [];
    let isChapterContentBlock = false; // summary first then content
    for (let j = 0; j < children.length; j++) {
      const child = children[j];
      const { type } = child;
      if (type === 'divider') {
        // isChapterContentBlock = true;
        // continue;
        break; // don't need to read content
      }
      if (child.type === 'paragraph') {
        const content = child[child.type].rich_text[0].text.content;
        if (isChapterContentBlock) {
          chapterContent.push(content);
        } else {
          chapterSummary.push(content);
        }
      }
    }
    currentChapters.push({
      name,
      content: chapterContent.join('\n'),
      summary: chapterSummary.join('\n'),
    });

    // stop at Summary
    if (name.startsWith('Summary')) {
      break;
    }
  }
  console.log('Current chapters content:', currentChapters);
  let currentChaptersSummary = currentChapters
    .slice()
    .reverse()
    .map((c) => c.summary)
    .join('\n');

  // get previous chapters data
  if (currentChapters.length) {
    const { totalTokens: currentChaptersSummaryTokens } =
      await countPromptTokens(currentChaptersSummary);

    console.log('Current chapters summary:', currentChaptersSummary);
    console.log(
      'Current chapters summary tokens:',
      currentChaptersSummaryTokens
    );

    if (currentChaptersSummaryTokens > maxTokens) {
      const summaryChapterSummariesResponse = await summaryChapterSummaries(
        currentChaptersSummary,
        summaryChapterSummariesOutputSentencesNum
      );
      currentChaptersSummary = summaryChapterSummariesResponse.result;
      const summaryChapterSummariesPrompt =
        summaryChapterSummariesResponse.prompt;
      console.log('New chapters summary:', currentChaptersSummary);

      // get number from last chapter name
      const currentChaptersOnly = currentChapters.filter((c) =>
        c.name.startsWith('C')
      );
      const endChapterNumber = parseInt(
        currentChaptersOnly[0].name.match(/C(\d+)/)[1]
      );
      const startChapterNumber = parseInt(
        currentChaptersOnly[currentChaptersOnly.length - 1].name.match(
          /C(\d+)/
        )[1]
      );
      const summaryName = `Summary C${startChapterNumber}-${endChapterNumber}`;
      console.log('Summary name:', summaryName);

      // save current chapters summary
      const currentChaptersSummaryPage = await createPage(
        { database_id: database.id },
        {
          Name: {
            title: [
              {
                type: 'text',
                text: {
                  content: summaryName,
                },
              },
            ],
          },
        },
        [
          {
            object: 'block',
            type: 'toggle',
            toggle: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: 'Prompt',
                  },
                },
              ],
              children: splitParagraphs(summaryChapterSummariesPrompt).map(
                (c) => ({
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
                })
              ),
            },
          },
          ...splitParagraphs(currentChaptersSummary).map((c) => ({
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
        ]
      );
      if (currentChaptersSummaryPage.status === 400) {
        console.log('Error:', currentChaptersSummaryPage);
        return;
      }
      console.log('Create summary page', currentChaptersSummaryPage);
    }
  }

  const chapterSummaryResponse = await summaryChapter(
    chapterContent,
    currentChaptersSummary,
    summaryChapterOutputSentencesNum
  );
  const chapterSummary = chapterSummaryResponse.result;
  const chapterSummaryPrompt = chapterSummaryResponse.prompt;

  const truncateWord = '**Nội dung Chương:**';
  const truncateChapterSummaryPrompt =
    chapterSummaryPrompt.split(truncateWord)[0] + truncateWord + '\n...';

  // save chapter summary
  const chapterNotionPage = await createPage(
    { database_id: database.id },
    {
      Name: {
        title: [
          {
            type: 'text',
            text: {
              content: `C${currentChapterNumber} - ${chapterTitle}`,
            },
          },
        ],
      },
      URL: {
        url: window.location.href,
      },
    },
    [
      {
        object: 'block',
        type: 'toggle',
        toggle: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Prompt',
              },
            },
          ],
          children: splitParagraphs(truncateChapterSummaryPrompt).map((c) => ({
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
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: chapterSummary,
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'divider',
        divider: {},
      },
      ...splitParagraphs(chapterContent).map((c) => ({
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
    ]
  );
  if (chapterNotionPage.status === 400) {
    console.log('Error:', chapterNotionPage);
    return;
  }
  console.log('Create page', chapterNotionPage);

  // move to next chapter
  if (autoNextPage) {
    document.querySelector('#next_chap').click();
  }
};
