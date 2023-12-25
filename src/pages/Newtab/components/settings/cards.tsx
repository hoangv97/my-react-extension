import { Checkbox } from '@/components/ui/checkbox';
import React from 'react';
import storage from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const CARDS = [
  'bookmark',
  'coin',
  'news',
  'note',
  'newsData',
  'mediapipe',
  'mindmap',
  'draw',
  'camera',
  'codeDemo',
];

const Cards = () => {
  const [hiddenCards, setHiddenCards] = React.useState<string[]>([]);

  React.useEffect(() => {
    const hiddenCards = storage.getLocalStorage(storage.KEYS.hiddenCards);
    if (hiddenCards) {
      setHiddenCards(hiddenCards);
    }
  }, []);

  React.useEffect(() => {
    storage.setLocalStorage(storage.KEYS.hiddenCards, hiddenCards);
  }, [hiddenCards]);

  const handleCheckedChange = (key: string, checked: string | boolean) => {
    if (checked) {
      setHiddenCards((prev) => [...prev, key]);
    } else {
      setHiddenCards((prev) => prev.filter((k) => k !== key));
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium leading-none">Hidden cards</h4>
      <ScrollArea className="h-[150px]">
        <div className="my-2 flex flex-col gap-2">
          {CARDS.map((card) => {
            return (
              <div key={card} className="flex items-center space-x-2">
                <Checkbox
                  id={card}
                  checked={hiddenCards.includes(card)}
                  onCheckedChange={(checked) =>
                    handleCheckedChange(card, checked)
                  }
                />
                <label
                  htmlFor={card}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {card}
                </label>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setHiddenCards(CARDS);
          }}
        >
          Select all
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setHiddenCards([]);
          }}
        >
          Select none
        </Button>
        <Button
          size="sm"
          onClick={() => {
            // reload page
            window.location.reload();
          }}
        >
          Reload
        </Button>
      </div>
    </div>
  );
};

export default Cards;
