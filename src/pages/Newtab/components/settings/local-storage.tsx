import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import React from 'react';

const LocalStorage = () => {
  const [localStorageKeys, setLocalStorageKeys] = React.useState<string[]>([]);
  const [selectedLocalStorageKeys, setSelectedLocalStorageKeys] =
    React.useState<string[]>([]);

  const getLocalStorageKeys = () => {
    const keys = Object.keys(localStorage);
    keys.sort();
    setLocalStorageKeys(keys);
  };

  React.useEffect(() => {
    getLocalStorageKeys();
  }, []);

  const handleCheckedChange = (key: string, checked: string | boolean) => {
    if (checked) {
      setSelectedLocalStorageKeys((prev) => [...prev, key]);
    } else {
      setSelectedLocalStorageKeys((prev) => prev.filter((k) => k !== key));
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium leading-none">Clear local storage</h4>
      <div className="my-2 flex flex-col gap-2">
        {localStorageKeys.map((key) => {
          return (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={selectedLocalStorageKeys.includes(key)}
                onCheckedChange={(checked) => handleCheckedChange(key, checked)}
              />
              <label
                htmlFor={key}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {key}
              </label>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedLocalStorageKeys(localStorageKeys);
          }}
        >
          Select all
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedLocalStorageKeys([]);
          }}
        >
          Select none
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            selectedLocalStorageKeys.forEach((key) => {
              localStorage.removeItem(key);
            });
            getLocalStorageKeys();
            setSelectedLocalStorageKeys([]);
          }}
          disabled={selectedLocalStorageKeys.length === 0}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default LocalStorage;
