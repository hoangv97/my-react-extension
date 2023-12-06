import React, { useCallback } from 'react';
import useStore from '../../store';
import { shallow } from 'zustand/shallow';
import { selector } from '../../store/mindmap';
import { useReactFlow } from 'reactflow';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export default function ContextMenu({
  id,
  top,
  left,
  right,
  bottom,
  ...props
}: any) {
  const { getNode } = useReactFlow();
  const { deleteNode, addNode } = useStore(selector, shallow);

  const duplicateNode = useCallback(() => {
    const node = getNode(id);
    if (!node) return;
    const position = {
      x: node.position.x + 50,
      y: node.position.y + 50,
    };

    addNode(node, position);
  }, [id, getNode]);

  const onDeleteNode = useCallback(() => {
    deleteNode(id);
  }, [id]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="absolute z-10"
      {...props}
    >
      <Command className="rounded-lg border shadow-md">
        <CommandList>
          <CommandGroup heading={`Node: ${id}`}>
            <CommandItem>
              <div onClick={duplicateNode}>Duplicate</div>
            </CommandItem>
            <CommandItem>
              <div onClick={onDeleteNode}>Delete</div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
