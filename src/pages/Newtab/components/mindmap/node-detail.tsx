import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ArrowUpRightSquareIcon } from 'lucide-react';
import { Editor } from 'novel';
import React, { useEffect, useState } from 'react';
import { Panel } from 'reactflow';
import { shallow } from 'zustand/shallow';
import useStore from '../../store';
import { selector } from '../../store/mindmap';

export default function NodeDetail() {
  const { selectedNode, nodes, edges, setData } = useStore(selector, shallow);

  const [open, setOpen] = useState(false);

  if (!selectedNode) {
    return null;
  }

  return (
    <Panel position="bottom-center">
      <Card>
        <CardContent className="flex gap-10 justify-between items-center p-2 pt-2 ml-5">
          <div className="text-lg">{selectedNode.data.label}</div>
          <Button
            size={'icon'}
            variant={'ghost'}
            onClick={() => {
              setOpen(true);
            }}
          >
            <ArrowUpRightSquareIcon />
          </Button>
        </CardContent>
      </Card>
      <Sheet open={open} onOpenChange={(val) => setOpen(val)}>
        <SheetContent className="p-0 sm:max-w-xl">
          <SheetHeader className="px-6 pt-3 pb-0">
            <SheetTitle>{selectedNode.data.label}</SheetTitle>
          </SheetHeader>
          <Separator className="mt-3" />
          <ScrollArea className="h-full">
            <Editor
              defaultValue={selectedNode.data.content || ''}
              onDebouncedUpdate={(editor) => {
                setData(
                  nodes.map((node) => {
                    if (node.id === selectedNode.id) {
                      return {
                        ...node,
                        data: {
                          ...node.data,
                          content: editor?.getJSON(),
                        },
                      };
                    }
                    return node;
                  }),
                  edges
                );
              }}
              disableLocalStorage={true}
              className="relative min-h-[500px] mb-5 w-full max-w-screen-lg bg-background"
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </Panel>
  );
}
