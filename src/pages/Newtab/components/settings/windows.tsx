import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';
import { shallow } from 'zustand/shallow';
import useStore from '../../store';
import { selector } from '../../store/window';
import { capitalize } from '@/lib/string';

const Cards = () => {
  const { windowList, setActiveWindow } = useStore(selector, shallow);

  return (
    <div>
      <h4 className="text-sm font-medium leading-none">Windows</h4>
      <ScrollArea className="max-h-[150px]">
        <div className="my-2 flex gap-2 flex-wrap">
          {windowList
            .filter(({ active }) => !active)
            .map((window) => {
              return (
                <Button
                  variant={'ghost'}
                  size={'sm'}
                  onClick={() => {
                    setActiveWindow(window.key, true);
                  }}
                >
                  {capitalize(window.key)}
                </Button>
              );
            })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Cards;
