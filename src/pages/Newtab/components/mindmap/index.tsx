import Window from '@/components/common/window';
import { CardContent } from '@/components/ui/card';
import storage from '@/lib/storage';
import React from 'react';
import 'reactflow/dist/style.css';
import Mindmap from './map';

const MindmapContainer = () => {
  const [state, setState] = React.useState<any>();
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  React.useEffect(() => {
    const state = storage.getLocalStorage(storage.KEYS.mindmapWindowRndState);
    if (state) {
      setState(state);
    } else {
      setState({
        x: 5,
        y: 5,
        width: 500,
        height: 500,
      });
    }
  }, []);

  const handleChangeState = (state: any) => {
    storage.setLocalStorage(storage.KEYS.mindmapWindowRndState, state);
  };

  const handleToggleFullScreen = (isFullScreen: boolean) => {
    setIsFullScreen(isFullScreen);
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
        <Mindmap />
      </CardContent>
    </Window>
  );
};

export default MindmapContainer;
