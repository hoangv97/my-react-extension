import { runSummarizer } from '../summarizer';
import { sleep } from '../utils';

export const handleChapterPage = async () => {
  try {
    // Config
    const maxTokensInPreviousSummaries = 5000;
    const maxTokensInChapterContent = 25000;
    const autoNextPage = true;
    const summaryChapterSummariesOutputSentencesNum = 20;
    const summaryChapterOutputSentencesNum = 5;

    // parse data from current page
    document
      .querySelectorAll('#chapter-container div')
      .forEach((e) => e.remove());
    document
      .querySelectorAll('#chapter-container a')
      .forEach((e) => e.remove());
    const innerHtml = document.querySelector('#chapter-container').innerHTML;
    const chapterContent = innerHtml
      .replace(/<br>/g, '\n')
      .replace(/<[^>]*>/g, '\n')
      .replace(/\n+/g, '\n')
      .trim();
    const chapterTitle = document.querySelector('.chapter-title').textContent;
    const novelTitle = document.querySelector('.booktitle').textContent;

    const goToNextPage = () => {
      document.querySelector('.nextchap').click();
    };

    runSummarizer(
      novelTitle,
      chapterTitle,
      chapterContent,
      goToNextPage,
      'en',
      maxTokensInPreviousSummaries,
      maxTokensInChapterContent,
      autoNextPage,
      summaryChapterSummariesOutputSentencesNum,
      summaryChapterOutputSentencesNum
    );
  } catch (error) {
    console.log('Retry handleChapterPage', error);
    await sleep(15000);
    // reload page
    window.location.reload();
  }
};
