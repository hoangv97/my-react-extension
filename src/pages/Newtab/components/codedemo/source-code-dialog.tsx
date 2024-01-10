import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import React from 'react';
import Markdown from 'react-markdown';

interface CodeEditorSourceCodeDialogProps {
  srcDoc: string;
}

export default function SourceCodeDialog({
  srcDoc,
}: CodeEditorSourceCodeDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Source code</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <Markdown
          // eslint-disable-next-line react/no-children-prop
          children={srcDoc}
          components={{
            pre: ({ node, children, ...props }) => {
              return (
                <pre {...props} className="overflow-x-auto my-4">
                  <div className="flex justify-end">
                    <Button
                      size={'sm'}
                      variant={'secondary'}
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(
                            (node?.children[0] as any).children[0].value
                          );
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  {children}
                </pre>
              );
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
