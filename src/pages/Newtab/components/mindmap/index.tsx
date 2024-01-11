import Window from '@/components/common/window';
import { useWindowState } from '@/pages/Newtab/hooks/useWindowState';
import React from 'react';
import 'reactflow/dist/style.css';
import Mindmap from './map';

const MindmapContainer = () => {
  const {
    state,
    isFullScreen,
    handleChangeState,
    handleToggleFullScreen,
    handleClose,
  } = useWindowState('mindmap');

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
      <Mindmap isFullScreen={isFullScreen} />
    </Window>
  );
};

export default MindmapContainer;
