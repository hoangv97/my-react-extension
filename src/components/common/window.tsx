import { Card } from '@/components/ui/card';
import React, { useEffect } from 'react';
import { Rnd } from 'react-rnd';

interface WindowProps {
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  children: React.ReactNode;
}

const Window = ({ x, y, width, height, children }: WindowProps) => {
  const [state, setState] = React.useState({
    x,
    y,
    width,
    height,
  });

  useEffect(() => {
    console.log('state', state);
  }, [state]);

  return (
    <Rnd
      size={{ width: state.width, height: state.height }}
      position={{ x: state.x, y: state.y }}
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
      <Card className="w-full h-full">{children}</Card>
    </Rnd>
  );
};

export default Window;
