import Window from '@/components/common/window';
import { CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import openai from '@/lib/openai';
import storage from '@/lib/storage';
import React from 'react';

const Note = () => {
  const [state, setState] = React.useState<any>();
  const [note, setNote] = React.useState<string>('');
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  React.useEffect(() => {
    const state = storage.getLocalStorage(storage.KEYS.noteWindowRndState);
    if (state) {
      setState(state);
    } else {
      setState({
        x: 5,
        y: 5,
        width: 200,
        height: 200,
      });
    }

    setNote(storage.getLocalStorage(storage.KEYS.noteContent) || '');
  }, []);

  React.useEffect(() => {
    storage.setLocalStorage(storage.KEYS.noteContent, note);
  }, [note]);

  const handleChangeState = (state: any) => {
    storage.setLocalStorage(storage.KEYS.noteWindowRndState, state);
  };

  const handleToggleFullScreen = (isFullScreen: boolean) => {
    setIsFullScreen(isFullScreen);
  };

  const ask = async () => {
    console.log(note);
    if (!note) {
      return;
    }
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
      {
        role: 'user',
        content: note,
      },
    ];
    const response = await openai.createChatCompletions({
      messages,
      model: 'gpt4',
    });
  };

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
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-full border-none font-sm bg-transparent resize-none focus-visible:ring-0 focus-visible:outline-none focus-visible:border-none focus-visible:ring-offset-0 focus-visible:ring-offset-transparent"
        />
      </CardContent>
    </Window>
  );
};

export default Note;
