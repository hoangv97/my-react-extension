import React from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { DashboardIcon } from '@radix-ui/react-icons';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ModeToggle } from '@/components/mode-toggle';

const Settings = () => {
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

  const handleLocalStorageCheckedChange = (
    key: string,
    checked: string | boolean
  ) => {
    if (checked) {
      setSelectedLocalStorageKeys((prev) => [...prev, key]);
    } else {
      setSelectedLocalStorageKeys((prev) => prev.filter((k) => k !== key));
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="absolute bottom-2 right-2 bg-transparent border-none text-white text-2xl z-10 h-10 w-10 rounded-full opacity-75"
          variant="outline"
          size="icon"
          onClick={getLocalStorageKeys}
        >
          <DashboardIcon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <h4 className="text-sm font-medium leading-none">
            Clear local storage
          </h4>
          <div className="my-2 flex flex-col gap-2">
            {localStorageKeys.map((key) => {
              return (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={selectedLocalStorageKeys.includes(key)}
                    onCheckedChange={(checked) =>
                      handleLocalStorageCheckedChange(key, checked)
                    }
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
          <div className="mb-3 flex gap-2">
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
          <Separator />
          <div className="flex items-center gap-3 my-3">
            <h4 className="text-sm font-medium leading-none">Mode</h4>
            <ModeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Settings;
