import { ThemeProvider } from '@/components/theme-provider';
import React, { Fragment, useRef } from 'react';
import { useFullscreen, useToggle } from 'react-use';
import { shallow } from 'zustand/shallow';
import Background from './components/background';
import Settings from './components/settings';
import useStore from './store';
import { selector } from './store/window';

const Newtab = () => {
  const { windowList } = useStore(selector, shallow);

  const containerRef = useRef(null);
  const [show, toggle] = useToggle(false);
  const isFullscreen = useFullscreen(containerRef, show, {
    onClose: () => toggle(false),
  });

  return (
    <ThemeProvider>
      <div ref={containerRef}>
        <Settings toggleFullscreen={toggle} />
        <Background />
        <div className="min-w-screen min-h-screen">
          {windowList
            .filter(({ active }) => active)
            .map((window) => {
              // add key prop to react node to avoid react warning
              return <Fragment key={window.key}>{window.component}</Fragment>;
            })}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Newtab;
