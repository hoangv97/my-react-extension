import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';
import React from 'react';

function MindMapEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY } = props;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY: sourceY + 0,
    targetX,
    targetY,
  });

  return <BaseEdge path={edgePath} {...props} />;
}

export default MindMapEdge;
