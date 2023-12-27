import { ComboboxPopover } from '@/components/common/combobox-popover';
import Window from '@/components/common/window';
import { CardContent } from '@/components/ui/card';
import storage from '@/lib/storage';
import React from 'react';
import GestureRecognizerContainer from './gesture-recognizer';
import Hand from './hand';
import Pose from './pose';
import FaceLandmarkDetection from './face-landmark';
import ObjectDetectorContainer from './object-detector';
import Actions from './actions';
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
  const [state, setState] = React.useState<any>();
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState(options[0].value);

  React.useEffect(() => {
    const state = storage.getLocalStorage(storage.KEYS.mediapipeWindowRndState);
    if (state) {
      setState(state);
    } else {
      setState({
        x: 5,
        y: 5,
        width: 720,
        height: 520,
      });
    }
  }, []);

  const handleChangeState = (state: any) => {
    storage.setLocalStorage(storage.KEYS.mediapipeWindowRndState, state);
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
      </CardContent>
    </Window>
  );
};

export default Mediapipe;
