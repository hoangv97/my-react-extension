import storage from '@/lib/storage';
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

interface WindowProps {
  key: string;
  component: React.ReactNode;
  active: boolean;
  zIndex: number;
}

const windowComponents = [
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
];

const getInitialWindowList = () => {
  const windowListStorage: WindowProps[] = storage.getLocalStorage(
    storage.KEYS.windows,
    []
  );
  const windowListStorageMap: any = windowListStorage.reduce(
    (acc: any, window) => {
      acc[window.key] = window;
      return acc;
    },
    {}
  );
  console.log('windowListStorageMap', windowListStorageMap);

  const windowList = windowComponents.map((window, i) => {
    const windowStorage = windowListStorageMap[window.key];
    return {
      active: false,
      zIndex: i,
      ...window,
      ...windowStorage,
    };
  });
  return windowList;
};

export type RFWindowState = {
  windowList: WindowProps[];
  setActiveWindow: (key: string, active: boolean) => void;
  setTopWindow: (key: string) => void;
};

export const selector = (state: RFWindowState) => ({
  windowList: state.windowList,
  setActiveWindow: state.setActiveWindow,
  setTopWindow: state.setTopWindow,
});

export const useWindowSlice = (set: any, get: any) => {
  const saveWindows = (newWindowList: WindowProps[]) => {
    set({
      windowList: newWindowList,
    });
    storage.setLocalStorage(
      storage.KEYS.windows,
      newWindowList.map((window) => {
        const keys = Object.keys(window).filter(
          (k) => !['component'].includes(k)
        );
        return keys.reduce((acc, key) => {
          acc[key] = (window as any)[key];
          return acc;
        }, {} as any);
      })
    );
  };

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
      saveWindows(newWindowList);
    },
    setTopWindow: (key: string) => {
      const windowList: WindowProps[] = get().windowList;
      const windowIndex = windowList.findIndex((window) => window.key === key);
      if (windowIndex === -1) {
        return;
      }
      // move window to the top, and set zIndex of other windows accordingly
      // if the window is already at the top, do nothing
      if (windowIndex === windowList.length - 1) {
        return;
      }
      const newWindowList = windowList.map((window, index) => {
        if (index === windowIndex) {
          return {
            ...window,
            zIndex: windowList.length - 1,
          };
        }
        if (index > windowIndex) {
          return {
            ...window,
            zIndex: window.zIndex - 1,
          };
        }
        return window;
      });
      saveWindows(newWindowList);
    },
  };
};
