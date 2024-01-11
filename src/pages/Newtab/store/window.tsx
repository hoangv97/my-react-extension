import Bookmark from '@/pages/Newtab/components/bookmark';
import Browser from '@/pages/Newtab/components/browser';
import Camera from '@/pages/Newtab/components/camera';
import CodeDemo from '@/pages/Newtab/components/codedemo';
import Coin from '@/pages/Newtab/components/coin';
import Draw from '@/pages/Newtab/components/draw';
import Mediapipe from '@/pages/Newtab/components/mediapipe';
import MindmapContainer from '@/pages/Newtab/components/mindmap';
import News from '@/pages/Newtab/components/news';
import NewsData from '@/pages/Newtab/components/newsdata';
import Note from '@/pages/Newtab/components/note';
import React from 'react';
import storage from '@/lib/storage';

const getInitialWindowList = () => {
  const activeWindowKeys =
    storage.getLocalStorage(storage.KEYS.activeWindowKeys) || [];
  return [
    {
      key: 'bookmark',
      component: <Bookmark />,
    },
    {
      key: 'coin',
      component: <Coin />,
    },
    {
      key: 'news',
      component: <News />,
    },
    {
      key: 'newsData',
      component: <NewsData />,
    },
    {
      key: 'note',
      component: <Note />,
    },
    {
      key: 'mediapipe',
      component: <Mediapipe />,
    },
    {
      key: 'mindmap',
      component: <MindmapContainer />,
    },
    {
      key: 'draw',
      component: <Draw />,
    },
    {
      key: 'camera',
      component: <Camera />,
    },
    {
      key: 'codeDemo',
      component: <CodeDemo />,
    },
    {
      key: 'browser',
      component: <Browser />,
    },
  ].map((window) => ({
    ...window,
    active: activeWindowKeys.includes(window.key),
  }));
};

interface WindowProps {
  key: string;
  component: React.ReactNode;
  active?: boolean;
}

export type RFWindowState = {
  windowList: WindowProps[];
  setActiveWindow: (key: string, active: boolean) => void;
};

export const selector = (state: RFWindowState) => ({
  windowList: state.windowList,
  setActiveWindow: state.setActiveWindow,
});

export const useWindowSlice = (set: any, get: any) => {
  return {
    windowList: getInitialWindowList(),
    setActiveWindow: (key: string, active: boolean) => {
      const windowList: WindowProps[] = get().windowList;
      const windowIndex = windowList.findIndex((window) => window.key === key);
      if (windowIndex === -1) {
        return;
      }
      const newWindowList = windowList.map((window, index) => {
        if (index === windowIndex) {
          return {
            ...window,
            active,
          };
        }
        return window;
      });
      set({
        windowList: newWindowList,
      });
      storage.setLocalStorage(
        storage.KEYS.activeWindowKeys,
        newWindowList
          .filter((window) => window.active)
          .map((window) => window.key)
      );
    },
  };
};
