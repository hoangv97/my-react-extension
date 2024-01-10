import Window from '@/components/common/window';
import { CardContent } from '@/components/ui/card';
import storage from '@/lib/storage';
import { useWindowState } from '@/pages/Newtab/hooks/useWindowState';
import { Editor } from 'novel';
import React from 'react';

const Note = () => {
  const [note, setNote] = React.useState<any>('');
  const { state, isFullScreen, handleChangeState, handleToggleFullScreen } =
    useWindowState(storage.KEYS.noteWindowRndState);

  React.useEffect(() => {
    setNote(storage.getLocalStorage(storage.KEYS.noteContent) || '');
  }, []);

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
        <Editor
          defaultValue={note || ''}
          onDebouncedUpdate={(editor) => {
            storage.setLocalStorage(
              storage.KEYS.noteContent,
              editor?.getJSON()
            );
          }}
          disableLocalStorage={true}
          className="relative w-full h-full bg-background"
        />
      </CardContent>
    </Window>
  );
};

export default Note;
