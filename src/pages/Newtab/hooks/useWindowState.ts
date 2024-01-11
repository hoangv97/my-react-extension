import storage from '@/lib/storage';
import { useCallback, useEffect, useState } from 'react';
import { useWindowSize } from 'react-use';
import useStore from '../store';
import { selector } from '../store/window';
import { shallow } from 'zustand/shallow';

interface WindowStateProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface StorageStateProps {
  pX: number;
  pY: number;
  pWidth: number;
  pHeight: number;
}

const stateToStorage = (
  state: WindowStateProps,
  windowWidth: number,
  windowHeight: number
): StorageStateProps => {
  const { x, y, width, height } = state;
  const pX = x / windowWidth;
  const pY = y / windowHeight;
  const pWidth = width / windowWidth;
  const pHeight = height / windowHeight;
  return { pX, pY, pWidth, pHeight };
};

const storageToState = (
  storageState: StorageStateProps,
  windowWidth: number,
  windowHeight: number
): WindowStateProps => {
  const { pX, pY, pWidth, pHeight } = storageState;
  const x = pX * windowWidth;
  const y = pY * windowHeight;
  const width = pWidth * windowWidth;
  const height = pHeight * windowHeight;
  return { x, y, width, height };
};

const storageKeyPostFix = 'WindowRndState';

export const useWindowState = (
  key: string,
  defaultState?: StorageStateProps
) => {
  const [state, setState] = useState<any>();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { width, height } = useWindowSize();
  const { setActiveWindow } = useStore(selector, shallow);

  useEffect(() => {
    const storageState = storage.getLocalStorage(key + storageKeyPostFix);
    if (storageState) {
      setState(storageToState(storageState, width, height));
    } else {
      setState(
        storageToState(
          defaultState || {
            pX: 0.2,
            pY: 0.2,
            pWidth: 0.5,
            pHeight: 0.5,
          },
          width,
          height
        )
      );
    }
  }, [width, height]);

  const handleChangeState = useCallback(
    (state: any) => {
      const { width: stateWidth, height: stateHeight } = state;

      // convert state width, height to number
      if (typeof stateWidth === 'string') {
        state.width = parseInt(stateWidth.replace('px', ''));
      }
      if (typeof stateHeight === 'string') {
        state.height = parseInt(stateHeight.replace('px', ''));
      }

      storage.setLocalStorage(
        key + storageKeyPostFix,
        stateToStorage(state, width, height)
      );
    },
    [key, width, height]
  );

  const handleToggleFullScreen = useCallback((isFullScreen: boolean) => {
    setIsFullScreen(isFullScreen);
  }, []);

  const handleClose = useCallback(() => {
    setActiveWindow(key, false);
  }, [key, setActiveWindow]);

  return {
    state,
    isFullScreen,
    handleChangeState,
    handleToggleFullScreen,
    handleClose,
  };
};
