import Window from '@/components/common/window';
import { CardContent } from '@/components/ui/card';
import storage from '@/lib/storage';
import { useWindowState } from '@/pages/Newtab/hooks/useWindowState';
import React from 'react';
import CodeEditor from './code-editor';

const CodeDemo = () => {
  const { state, isFullScreen, handleChangeState, handleToggleFullScreen } =
    useWindowState(storage.KEYS.codeDemoWindowRndState);

  if (!state) {
    return null;
  }

  return (
    <Window
      {...state}
      onChangeState={handleChangeState}
      onToggleFullScreen={handleToggleFullScreen}
      cardOpacity={0.85}
    >
      <CardContent className="pt-2 h-full overflow-y-auto">
        <CodeEditor />
      </CardContent>
    </Window>
  );
};

export default CodeDemo;
