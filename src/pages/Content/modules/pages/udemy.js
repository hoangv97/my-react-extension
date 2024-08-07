import {
  queryDatabase,
  createPage,
  appendBlockChildren,
  splitParagraphs,
} from '../notion';
import { generateContent } from '../summarizer';
import { getTextContentWithSpaces, sleep } from '../utils';

const databaseId = '41e58c15320a45a1b59e5b6430ae3894';

const autoNextPage = true;

const getLessonSummary = async (
  courseTitle,
  sectionTitle,
  itemTitle,
  transcript
) => {
  let prompt = `**Mission: Summarize the Current Lesson in a Course**

**Goal:** You are tasked with creating a concise summary of the main takeaways and actionable points from the current lesson of a course. Only use the information provided in the lesson's transcription below.

**Instructions:**
- Style: Strive to match the style of the lesson as closely as possible.
- Content: Focus solely on the content of this lesson. Do not include any outside information or details not present in the lesson.
- Clarity: Ensure the summary is clear, coherent, and comprehensive. If it has the abbreviation, explain it.

**Course Title**: ${courseTitle}

**Section Title**: ${sectionTitle}

**Lesson Title**: ${itemTitle}

**Transcription of the lesson:**
${transcript}`;

  const result = await generateContent(prompt);
  return {
    result,
    prompt,
  };
};

const saveLessonPage = async (
  courseTitle,
  sectionTitle,
  lessonTitle,
  content,
  pageNotionId
) => {
  const { result, prompt } = await getLessonSummary(
    courseTitle,
    sectionTitle,
    lessonTitle,
    content
  );

  // save to notion
  const children = [
    ...splitParagraphs(result).map((c) => ({
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
    {
      object: 'block',
      type: 'divider',
      divider: {},
    },
    ...splitParagraphs(content).map((c) => ({
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
  ];
  const activeLessonPage = await createPage(
    { page_id: pageNotionId },
    {
      title: [
        {
          text: {
            content: lessonTitle,
          },
        },
      ],
    },
    children
  );
  console.log('Create active lesson page:', activeLessonPage);
};

export const handleCourseContentPage = async (
  currentNotionPageId = undefined,
  previousActiveLessonTitle = undefined
) => {
  const courseUrl = window.location.href.split('/learn')[0];

  const playBtn = document.querySelector('button[data-purpose="play-button"]');
  if (playBtn) {
    playBtn.click();
  }

  // get the course title
  const courseTitle = document.querySelector(
    'h1[data-purpose="course-header-title"]'
  ).textContent;

  const { results } = await queryDatabase(databaseId, {
    and: [
      {
        property: 'URL',
        rich_text: {
          equals: courseUrl,
        },
      },
    ],
  });

  let pageId = currentNotionPageId;

  if (!pageId) {
    if (!results.length) {
      // create new page
      const properties = {
        Name: {
          title: [
            {
              text: {
                content: courseTitle,
              },
            },
          ],
        },
        URL: {
          url: courseUrl,
        },
      };

      const page = await createPage(
        {
          database_id: databaseId,
        },
        properties
      );
      console.log('Create course page:', page);
      pageId = page.id;
    } else {
      pageId = results[0].id;
      console.log('Found course page:', pageId);
      // return;
    }
  }

  // get sections
  const sectionElements = document.querySelectorAll(
    'div[data-purpose*="section-panel"]'
  );

  // get active lesson data
  let activeSectionTitle = null;
  let activeLessonTitle = null;

  for (let i = 0; i < sectionElements.length; i++) {
    const sectionElement = sectionElements[i];

    const sectionTitle = sectionElement.querySelector('h3').textContent;

    const itemElements = sectionElement.querySelectorAll(
      'li[class*=curriculum-item-]'
    );

    for (let j = 0; j < itemElements.length; j++) {
      const itemElement = itemElements[j];

      const itemTitle = itemElement.querySelector(
        'span[data-purpose="item-title"]'
      ).textContent;

      const isActive = itemElement.getAttribute('aria-current') === 'true';

      if (isActive) {
        console.log('Active:', sectionTitle, itemTitle);
        activeSectionTitle = sectionTitle;
        activeLessonTitle = itemTitle;

        if (previousActiveLessonTitle === activeLessonTitle) {
          console.log('Already processed:', activeLessonTitle);
          return;
        }

        if (j === 0) {
          // create section block
          const childrenBlocks = [
            {
              object: 'block',
              type: 'heading_3',
              heading_3: {
                rich_text: [
                  {
                    text: {
                      content: sectionTitle,
                    },
                  },
                ],
              },
            },
          ];

          await appendBlockChildren(pageId, childrenBlocks);

          console.log('Create section block:', sectionTitle);
        }

        break;
      }
    }
  }

  // open the transcript
  const transcriptBtn = document.querySelector(
    'button[data-purpose="transcript-toggle"]'
  );

  if (transcriptBtn) {
    transcriptBtn.click();

    await sleep(2000);

    // get the transcript
    const transcript = Array.from(
      document.querySelectorAll('p[data-purpose="transcript-cue"]')
    )
      .map((e) => e.textContent)
      .join('\n');

    // console.log('Transcript:', transcript);

    await saveLessonPage(
      courseTitle,
      activeSectionTitle,
      activeLessonTitle,
      transcript,
      pageId
    );

    transcriptBtn.click();

    await sleep(2000);
  } else {
    // no transcript, try read text
    const textContainer = document.querySelector(
      'div[class*=text-viewer--container]'
    );
    if (textContainer) {
      const content = getTextContentWithSpaces(textContainer);

      await saveLessonPage(
        courseTitle,
        activeSectionTitle,
        activeLessonTitle,
        content,
        pageId
      );
    }
  }

  // Find the next lesson
  if (autoNextPage) {
    let foundActive = false;
    let nextElement = null;

    const sectionElements = document.querySelectorAll(
      'div[data-purpose*="section-panel"]'
    );

    for (let i = 0; i < sectionElements.length; i++) {
      const sectionElement = sectionElements[i];

      const itemElements = sectionElement.querySelectorAll(
        'li[class*=curriculum-item-]'
      );

      for (let j = 0; j < itemElements.length; j++) {
        const itemElement = itemElements[j];

        if (foundActive) {
          nextElement = itemElement.querySelector('.item-link');
          break;
        }

        const isActive = itemElement.getAttribute('aria-current') === 'true';

        if (isActive) {
          foundActive = true;

          if (j === itemElements.length - 1 && i < sectionElements.length - 1) {
            const nextSectionElement = sectionElements[i + 1];
            // open the next section
            nextSectionElement.querySelector('div > div').click();
            await sleep(2000);
          }
        }
      }
    }

    if (nextElement) {
      nextElement.click();
      await sleep(2000);
      handleCourseContentPage(pageId, activeLessonTitle);
    } else {
      console.log('No next lesson element');
    }
  }
};
