import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import OpenAI from 'openai';
import secrets from 'secrets';
import {
  createDatabase,
  createPage,
  getAllBlockChildren,
  getBlockChildren,
  queryDatabase,
  splitParagraphs,
} from './notion';
import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  sleep,
} from './utils';

const geminiModel = 'gemini-1.5-pro';

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const getRandomApiKey = () => {
  const randomIndex = Math.floor(
    Math.random() * secrets.GEMINI_API_KEYS.length
  );
  return secrets.GEMINI_API_KEYS[randomIndex];
};

export const countPromptTokens = async (prompt) => {
  const genAI = new GoogleGenerativeAI(getRandomApiKey());
  const model = genAI.getGenerativeModel({
    model: geminiModel,
    safetySettings,
  });
  try {
    const response = await model.countTokens(prompt);
    return response;
  } catch (error) {
    // try again after random time from 3 to 10 seconds
    await sleep(Math.floor(Math.random() * 7 + 3) * 1000);
    console.log('Retry countPromptTokens', error);

    const response = await countPromptTokens(prompt);
    return response;
  }
};

export const generateContent = async (prompt, retriedTimes = 0) => {
  const genAI = new GoogleGenerativeAI(getRandomApiKey());

  const model = genAI.getGenerativeModel({
    model: geminiModel,
    safetySettings,
  });

  const openai = new OpenAI({
    apiKey: secrets.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  try {
    if (retriedTimes >= 5) {
      // try OpenAI
      console.log("Try OpenAI's GPT");
      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o',
      });
      const text = chatCompletion.choices[0].message.content?.trim();
      // console.log(text);
      if (!text) {
        throw new Error('Empty response');
      }
      return text;
    }
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim().replaceAll('  ', ' ');
    // console.log(text);
    return text;
  } catch (error) {
    // try again after random time from 3 to 10 seconds
    await sleep(Math.floor(Math.random() * 7 + 3) * 1000);
    console.log('Retry generateContent', error);
    const text = await generateContent(prompt, retriedTimes + 1);
    return text;
  }
};

export const summaryChapterSummaries = async (
  language,
  summaries,
  outputSentencesNum = 10
) => {
  let prompt = `**Mission: Summarize the summaries of the chapters in a novel**
  
**Goal:** You are assigned to create a brief summary of the main events from the chapter summaries of a novel. Only use the information contained below. Create a summary so that the reader understands the content and context of the novel to make a new chapter summary.

**Instructions:**
- Length: The summary should not exceed ${outputSentencesNum} sentences. Try to use fewer sentences if possible.
- Language: The summary must be written in the same language as the chapter content below: specifically English.
- Style: Try to match the writing style of the novel as closely as possible. Do not use introductory phrases like "This chapter talks about," "This chapter begins with," or similar.
- Content: Focus only on the main events. Do not include any external information or details not present in the chapter.
- Clarity: Ensure the summary is clear, coherent, and comprehensive.

**Content of the summaries:**
${summaries}`;

  if (language === 'vi') {
    prompt = `**Nhiệm vụ: Tóm tắt lại các tóm tắt của các chương trong một tiểu thuyết**
  
**Mục tiêu:** Bạn được giao nhiệm vụ tạo một bản tóm tắt ngắn gọn về các sự kiện chính từ các tóm tắt của các chương của một tiểu thuyết. Chỉ sử dụng thông tin có trong nội dung dưới đây. Tóm tắt sao cho người đọc hiểu rõ hơn về nội dung, bối cảnh của tiểu thuyết để tạo ra một tóm tắt chương mới.

**Hướng dẫn:**
- Độ dài: Bản tóm tắt không được dài quá ${outputSentencesNum} câu. Cố gắng sử dụng ít câu hơn nếu được.
- Ngôn ngữ: Bản tóm tắt phải được viết bằng cùng ngôn ngữ với nội dung chương dưới đây: cụ thể là tiếng Việt
- Phong cách: Cố gắng khớp với phong cách viết của tiểu thuyết càng sát càng tốt. Không sử dụng mở đầu kiểu như "Chương này nói về", "Chương này bắt đầu với" hoặc tương tự.
- Nội dung: Chỉ tập trung vào các sự kiện chính. Không bao gồm bất kỳ thông tin bên ngoài hoặc chi tiết không có trong chương.
- Rõ ràng: Đảm bảo bản tóm tắt dễ hiểu, liền mạch và toàn diện.

**Nội dung các tóm tắt:**
${summaries}`;
  }

  const result = await generateContent(prompt);
  return {
    result,
    prompt,
  };
};

export const summaryChapter = async (
  language,
  content,
  previousSummary,
  outputSentencesNum = 5
) => {
  let prompt = `**Mission: Summarize the Current Chapter of a Novel**

**Goal:** You are tasked with creating a concise summary of the main events from the current chapter of a novel. Only use the information provided in the chapter below.

**Instructions:**
- Length: The summary should not exceed ${outputSentencesNum} sentences. Try to use fewer sentences if possible.
- Language: The summary must be written in the same language as the chapter content below: specifically, English.
- Style: Strive to match the writing style of the novel as closely as possible. Do not use opening phrases such as "This chapter discusses," "This chapter begins with," or similar.
- Content: Focus solely on the main events. Do not include any outside information or details not present in the chapter.
- Clarity: Ensure the summary is clear, coherent, and comprehensive.

**Summary of Previous Chapters:**
${previousSummary}

**Chapter Content:**
${content}`;

  if (language === 'vi') {
    prompt = `**Nhiệm vụ: Tóm tắt Chương hiện tại của một Tiểu thuyết**

**Mục tiêu:** Bạn được giao nhiệm vụ tạo một bản tóm tắt ngắn gọn về các sự kiện chính từ chương hiện tại của một tiểu thuyết. Chỉ sử dụng thông tin có trong nội dung chương dưới đây.

**Hướng dẫn:**
- Độ dài: Bản tóm tắt không được dài quá ${outputSentencesNum} câu. Cố gắng sử dụng ít câu hơn nếu được.
- Ngôn ngữ: Bản tóm tắt phải được viết bằng cùng ngôn ngữ với nội dung chương dưới đây: cụ thể là tiếng Việt
- Phong cách: Cố gắng khớp với phong cách viết của tiểu thuyết càng sát càng tốt. Không sử dụng mở đầu kiểu như "Chương này nói về", "Chương này bắt đầu với" hoặc tương tự.
- Nội dung: Chỉ tập trung vào các sự kiện chính. Không bao gồm bất kỳ thông tin bên ngoài hoặc chi tiết không có trong chương.
- Rõ ràng: Đảm bảo bản tóm tắt dễ hiểu, liền mạch và toàn diện.

**Tóm tắt các chương trước:**
${previousSummary}

**Nội dung Chương:**
${content}`;
  }

  const result = await generateContent(prompt);
  return {
    result,
    prompt,
  };
};

const getTruncateWord = (language) => {
  if (language === 'vi') {
    return '**Nội dung Chương:**';
  } else {
    return '**Chapter Content:**';
  }
};

const getChapterSummary = async (id) => {
  // get data from storage
  const key = '______chapter_summaries';
  const summaries = getLocalStorage(key) || {};

  if (Object.keys(summaries).length > 100) {
    // clear storage
    console.log('Clear chapter summaries storage');
    removeLocalStorage(key);
  }

  if (summaries[id]) {
    console.log('Get chapter summary from storage', id, summaries[id]);
    return summaries[id];
  }

  const { results: children } = await getBlockChildren(id);
  const chapterSummary = [];
  for (const child of children) {
    const { type } = child;
    if (child.type === 'paragraph') {
      const content = child[child.type].rich_text[0].text.content;
      chapterSummary.push(content);
    } else if (type === 'divider') {
      break;
    }
  }

  // save to storage
  summaries[id] = chapterSummary;
  setLocalStorage(key, summaries);

  return chapterSummary;
};

export const runSummarizer = async (
  novelTitle,
  chapterTitle,
  chapterContent,
  goToNextPage,
  language,
  maxTokensInPreviousSummaries,
  maxTokensInChapterContent,
  autoNextPage,
  summaryChapterSummariesOutputSentencesNum,
  summaryChapterOutputSentencesNum
) => {
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
  const urlSet = new Set();
  let currentChapterNumber = 1;

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const { id, properties } = chapter;
    const name = properties.Name.title[0].text.content;
    const url = properties.URL.url;

    if (url && urlSet.has(url)) {
      console.log('Duplicate URL:', url);
      continue;
    }
    urlSet.add(url);

    if (url === window.location.href) {
      console.log('Chapter already exists:', name);

      // move to next chapter
      if (autoNextPage) {
        goToNextPage();
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

    const chapterSummary = await getChapterSummary(id);
    currentChapters.push({
      name,
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

    if (currentChaptersSummaryTokens > maxTokensInPreviousSummaries) {
      const summaryChapterSummariesResponse = await summaryChapterSummaries(
        language,
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
              children: splitParagraphs(summaryChapterSummariesPrompt)
                .slice(0, 100)
                .map((c) => ({
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

  let chapterSummary;
  let chapterSummaryPrompt;

  // count tokens of chapter content
  // if it's too long, split it into multiple parts by paragraphs
  const { totalTokens: chapterContentTokens } = await countPromptTokens(
    chapterContent
  );
  console.log('Chapter content tokens:', chapterContentTokens);
  if (chapterContentTokens > maxTokensInChapterContent) {
    // split chapter content into 2 paragraphs
    const paragraphs = splitParagraphs(chapterContent);
    const half = Math.ceil(paragraphs.length / 2);
    const firstPart = paragraphs.slice(0, half).join('\n');
    const secondPart = paragraphs.slice(half).join('\n');
    console.log('Split chapter content:', firstPart);
    console.log('Split chapter content:', secondPart);
    // // count tokens of each part
    // const { totalTokens: firstPartTokens } = await countPromptTokens(firstPart);
    // const { totalTokens: secondPartTokens } = await countPromptTokens(
    //   secondPart
    // );
    // console.log('First part tokens:', firstPartTokens);
    // console.log('Second part tokens:', secondPartTokens);
    const chapterSummaryResponse = await summaryChapter(
      language,
      firstPart,
      currentChaptersSummary,
      summaryChapterOutputSentencesNum
    );
    const chapterSummary1 = chapterSummaryResponse.result;
    const chapterSummaryPrompt1 = chapterSummaryResponse.prompt;
    console.log('First part summary:', chapterSummary1);

    // summary second part
    currentChaptersSummary += '\n' + chapterSummary1;
    const chapterSummaryResponse2 = await summaryChapter(
      language,
      secondPart,
      currentChaptersSummary,
      summaryChapterOutputSentencesNum
    );
    const chapterSummary2 = chapterSummaryResponse2.result;
    const chapterSummaryPrompt2 = chapterSummaryResponse2.prompt;
    console.log('Second part summary:', chapterSummary2);

    chapterSummary = chapterSummary1 + '\n' + chapterSummary2;
    chapterSummaryPrompt = chapterSummaryPrompt2;
  } else {
    const chapterSummaryResponse = await summaryChapter(
      language,
      chapterContent,
      currentChaptersSummary,
      summaryChapterOutputSentencesNum
    );
    chapterSummary = chapterSummaryResponse.result;
    chapterSummaryPrompt = chapterSummaryResponse.prompt;
  }

  const truncateWord = getTruncateWord(language);
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
          children: splitParagraphs(truncateChapterSummaryPrompt)
            .slice(0, 100)
            .map((c) => ({
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
      ...splitParagraphs(chapterSummary).map((c) => ({
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
    goToNextPage();
  }
};
