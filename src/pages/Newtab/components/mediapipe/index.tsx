import { ComboboxPopover } from '@/components/common/combobox-popover';
import Window from '@/components/common/window';
import storage from '@/lib/storage';
import { useWindowState } from '@/pages/Newtab/hooks/useWindowState';
import React from 'react';
import Actions from './actions';
import FaceLandmarkDetection from './face-landmark';
import GestureRecognizerContainer from './gesture-recognizer';
import Hand from './hand';
import ObjectDetectorContainer from './object-detector';
import Pose from './pose';
import VideoPose from './videoPose';

const options = [
  {
    label: 'Video',
    value: 'video',
    component: <VideoPose />,
  },
  {
    label: 'Actions',
    value: 'action',
    component: <Actions />,
  },
  {
    label: 'Pose',
    value: 'pose',
    component: <Pose />,
  },
  {
    label: 'Hand',
    value: 'hand',
    component: <Hand />,
  },
  {
    label: 'Gesture Recognizer',
    value: 'gesture-recognizer',
    component: <GestureRecognizerContainer />,
  },
  {
    label: 'Face Landmark Detection',
    value: 'face-landmark-detection',
    component: <FaceLandmarkDetection />,
  },
  {
    label: 'Object Detection',
    value: 'object-detection',
    component: <ObjectDetectorContainer />,
  },
];

const Mediapipe = () => {
  const {
    state,
    isFullScreen,
    handleChangeState,
    handleToggleFullScreen,
    handleClose,
  } = useWindowState('mediapipe');
  const [selectedOption, setSelectedOption] = React.useState(options[0].value);

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
      <div>
        <ComboboxPopover
          value={selectedOption}
          options={options}
          onChange={(val) => setSelectedOption(val)}
        />
      </div>
      <div className="mt-2">
        {options.find((option) => option.value === selectedOption)?.component}
      </div>
    </Window>
  );
};

export default Mediapipe;
