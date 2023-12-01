import { Card } from '@/components/ui/card';
import { EnterFullScreenIcon, ExitFullScreenIcon } from '@radix-ui/react-icons';
import React, { useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useTheme } from '@/components/theme-provider';

interface WindowProps {
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  cardClassName?: string;
  cardOpacity?: number;
  onChangeState?: (state: any) => void;
  onToggleFullScreen?: (isFullScreen: boolean) => void;
  children?: React.ReactNode;
}

const Window = ({
  x,
  y,
  width,
  height,
  cardClassName,
  cardOpacity,
  onChangeState,
  onToggleFullScreen,
  children,
}: WindowProps) => {
  const [state, setState] = React.useState({
    x,
    y,
    width,
    height,
  });
  const [previousState, setPreviousState] = React.useState(state);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const { theme } = useTheme();

  useEffect(() => {
    // console.log('state', state);
    onChangeState && !isFullScreen && onChangeState(state);
  }, [state]);

  const toggleFullScreen = () => {
    if (isFullScreen) {
      setState(previousState);
    } else {
      setPreviousState(state);
      setState({
        ...state,
        x: 0,
        y: 0,
        width: '100%',
        height: '100%',
      });
    }
    setIsFullScreen(!isFullScreen);
    onToggleFullScreen && onToggleFullScreen(!isFullScreen);
  };

  const getCardBackground = () => {
    const lightColor = '255, 255, 255';
    const darkColor = '2, 8, 23';
    let color = theme === 'dark' ? darkColor : lightColor;
    if (theme === 'system') {
      color = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? darkColor
        : lightColor;
    }
    if (isFullScreen) {
      return `rgba(${color}, 0.9)`;
    } else {
      return `rgba(${color}, ${cardOpacity || '0.7'})`;
    }
  };

  return (
    <Rnd
      size={{ width: state.width, height: state.height }}
      position={{ x: state.x, y: state.y }}
      bounds={'parent'}
      disableDragging={isFullScreen}
      enableResizing={!isFullScreen}
      className={`${isFullScreen ? 'z-50' : ''}`}
      onDragStop={(e, d) => {
        setState({ ...state, x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setState({
          ...state,
          width: ref.style.width,
          height: ref.style.height,
          ...position,
        });
      }}
    >
      <Card
        className={`w-full h-full ${cardClassName || ''}`}
        style={{ background: getCardBackground() }}
      >
        {children}
        <div className="absolute right-2 bottom-2 text-white hover:text-black">
          {isFullScreen ? (
            <ExitFullScreenIcon
              className="cursor-pointer"
              onClick={toggleFullScreen}
            />
          ) : (
            <EnterFullScreenIcon
              className="cursor-pointer"
              onClick={toggleFullScreen}
            />
          )}
        </div>
      </Card>
    </Rnd>
  );
};

export default Window;
