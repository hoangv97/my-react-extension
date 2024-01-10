import Window from '@/components/common/window';
import { useWindowState } from '@/pages/Newtab/hooks/useWindowState';
import { CardContent } from '@/components/ui/card';
import storage from '@/lib/storage';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import React from 'react';

const Draw = () => {
  const { state, isFullScreen, handleChangeState, handleToggleFullScreen } =
    useWindowState(storage.KEYS.drawWindowRndState);

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
        <Tldraw hideUi={!isFullScreen} />
      </CardContent>
    </Window>
  );
};

export default Draw;
