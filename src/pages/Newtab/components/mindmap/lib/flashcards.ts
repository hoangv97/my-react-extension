import { nanoid } from 'nanoid';
import { getData, saveData } from './data';

export interface FlashcardProps {
  id: string;
  front: any;
  back: any;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateFlashcardProps {
  id?: string;
  front?: any;
  back?: any;
}

const getAllFlashcardsMap = () => {
  const data = getData();
  const flashcards = data.flashcards || {};
  return flashcards;
};

export const getFlashcards = (nodeId: string) => {
  const flashcards = getAllFlashcardsMap();
  return flashcards[nodeId] || [];
};

export const createFlashcard = (
  nodeId: string,
  flashcard: UpdateFlashcardProps
) => {
  const flashcardsMap = getAllFlashcardsMap();
  saveData({
    flashcards: {
      ...flashcardsMap,
      [nodeId]: (flashcardsMap[nodeId] || []).concat({
        ...flashcard,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    },
  });
};

export const updateFlashcard = (
  nodeId: string,
  flashcard: UpdateFlashcardProps
) => {
  const flashcardsMap = getAllFlashcardsMap();
  const flashcards = flashcardsMap[nodeId] || [];
  const index = flashcards.findIndex(
    (item: FlashcardProps) => item.id === flashcard.id
  );
  if (index > -1) {
    flashcards[index] = {
      ...flashcards[index],
      ...flashcard,
      updatedAt: new Date().toISOString(),
    };
    saveData({
      flashcards: {
        ...flashcardsMap,
        [nodeId]: flashcards,
      },
    });
  }
};

export const deleteFlashcard = (nodeId: string, id: string) => {
  const flashcardsMap = getAllFlashcardsMap();
  const flashcards = flashcardsMap[nodeId] || [];
  const index = flashcards.findIndex((item: FlashcardProps) => item.id === id);
  if (index > -1) {
    flashcards.splice(index, 1);
    saveData({
      flashcards: {
        ...flashcardsMap,
        [nodeId]: flashcards,
      },
    });
  }
};

export const deleteAllFlashcards = (nodeId: string) => {
  const flashcardsMap = getAllFlashcardsMap();
  delete flashcardsMap[nodeId];
  saveData({
    flashcards: flashcardsMap,
  });
};
