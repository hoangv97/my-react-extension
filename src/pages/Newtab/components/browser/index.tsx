import Window from '@/components/common/window';
import { Input } from '@/components/ui/input';
import storage from '@/lib/storage';
import { useWindowState } from '@/pages/Newtab/hooks/useWindowState';
import React, { useState } from 'react';

export default function Browser() {
  const {
    state,
    isFullScreen,
    handleChangeState,
    handleToggleFullScreen,
    handleClose,
  } = useWindowState('browser');

  const [url, setUrl] = useState('https://www.google.com/webhp?igu=1');

  if (!state) {
    return null;
  }

  return (
    <Window
      {...state}
      onChangeState={handleChangeState}
      onToggleFullScreen={handleToggleFullScreen}
      onClose={handleClose}
      cardOpacity={0.85}
    >
      <div className="mb-2">
        <Input
          defaultValue={url}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setUrl(e.currentTarget.value);
            }
          }}
        />
      </div>
      <iframe
        src={url}
        className="w-full h-[calc(100%_-_50px)] bg-white border-none"
        title="browser"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-top-navigation-by-user-activation"
      />
    </Window>
  );
}
