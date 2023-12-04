import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';
import Ai from './components/ai';

const Popup = () => {
  return (
    <Tabs defaultValue="AI">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="AI">AI</TabsTrigger>
      </TabsList>
      <TabsContent value="AI" className="px-2">
        <Ai />
      </TabsContent>
    </Tabs>
  );
};

export default Popup;
