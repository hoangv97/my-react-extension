import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';
import openai from '@/lib/openai';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ComboboxPopover } from '@/components/common/combobox-popover';
import { PlusIcon } from '@radix-ui/react-icons';
import { Skeleton } from '@/components/ui/skeleton';

interface InputComponentProps {
  type: string;
  value: string;
  options?: any[];
}

const inputComponentTypes = [
  {
    label: 'Text',
    value: 'text',
  },
  {
    label: 'Templates',
    value: 'templates',
  },
  {
    label: 'DOM',
    value: 'dom',
  },
];

const domOptions = ['textSelection', 'textContent', 'innerHTML', 'innerText'];

const templatesOptions = [
  {
    label: 'Summarizer',
    value:
      'Summarize the main points and key information from the text below in a concise and clear way:',
  },
  {
    label: 'ELI5',
    value: 'Explain the following text in simple terms:',
  },
  {
    label: 'Translate to Vietnamese',
    value: 'Translate the following text into Vietnamese:',
  },
  {
    label: 'Generate questions',
    value: `You are a personal assistant. Your job is to provide questions instead of answers.
Based on the text below, please provide me with a list of practice questions to help me:
1. Recall the main ideas and concepts.
2. Explain the knowledge or concepts that I have learned.
3.Apply the knowledge to different situations.
Text to generate questions from:`,
  },
];

const Ai = () => {
  const [currentTab, setCurrentTab] = React.useState<any>({});
  const [inputComponents, setInputComponents] = React.useState<
    InputComponentProps[]
  >([
    {
      type: 'text',
      value: '',
    },
  ]);
  const [selectedNewInputComponentType, setSelectedNewInputComponentType] =
    React.useState<string>('text');
  const [messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (tab) {
        try {
          const [{ result }]: any = await chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            func: () => {
              const body = document.querySelector('body');
              const textSelection = window.getSelection()?.toString();
              const textContent = body?.textContent;
              const innerHTML = body?.innerHTML;
              const innerText = body?.innerText;
              return {
                textSelection,
                textContent,
                innerHTML,
                innerText,
              };
            },
          });
          let resultKeys = Object.keys(result);
          const newResult: any = {};
          resultKeys.forEach((key) => {
            if (result[key]) {
              newResult[key.toLowerCase()] = result[key];
            }
          });
          setCurrentTab(newResult);
        } catch (error) {
          console.log(error);
        }
      }
    });
  }, []);

  const addInputComponent = () => {
    const newInputComponent: InputComponentProps = {
      type: selectedNewInputComponentType,
      value: '',
    };
    if (selectedNewInputComponentType === 'dom') {
      newInputComponent.options = domOptions;
    }
    if (selectedNewInputComponentType === 'templates') {
      newInputComponent.options = templatesOptions;
    }
    debugger;
    setInputComponents([...inputComponents, newInputComponent]);
  };

  const send = async () => {
    const sendInput = inputComponents
      .map((inputComponent) => {
        if (inputComponent.type === 'dom') {
          return currentTab[inputComponent.value];
        }
        return inputComponent.value;
      })
      .join('\n')
      .trim();
    if (!sendInput) {
      return;
    }
    const newMessages = [
      ...messages,
      {
        content: sendInput,
        role: 'user',
      },
    ];
    setLoading(true);
    setMessages(newMessages);
    const response = await openai.createChatCompletions({
      messages: newMessages,
    });
    setLoading(false);
    setMessages((prev) => [...prev, response.choices[0].message]);
  };

  return (
    <div>
      <ScrollArea className="h-[250px]">
        <div className="flex flex-col gap-2">
          {inputComponents.map((inputComponent, index) => {
            if (inputComponent.type === 'text') {
              return (
                <Textarea
                  key={index}
                  value={inputComponent.value}
                  onChange={(e) => {
                    const newInputComponents = [...inputComponents];
                    newInputComponents[index].value = e.target.value;
                    setInputComponents(newInputComponents);
                  }}
                />
              );
            }
            if (inputComponent.type === 'dom' && inputComponent.options) {
              return (
                <ComboboxPopover
                  label="DOM element"
                  options={inputComponent.options.map((option) => ({
                    label: option,
                    value: option,
                  }))}
                  placeholder="Select DOM element"
                  onChange={(value) => {
                    const newInputComponents = [...inputComponents];
                    newInputComponents[index].value = value;
                    setInputComponents(newInputComponents);
                  }}
                />
              );
            }
            if (inputComponent.type === 'templates' && inputComponent.options) {
              return (
                <ComboboxPopover
                  label="Templates"
                  options={inputComponent.options}
                  placeholder="Select a template"
                  onChange={(value) => {
                    const newInputComponents = [...inputComponents];
                    newInputComponents[index].value = value;
                    setInputComponents(newInputComponents);
                  }}
                />
              );
            }
            return null;
          })}
          <div className="flex justify-between gap-2 mb-2">
            <div className="flex gap-2">
              <ComboboxPopover
                placeholder="Select input type"
                options={inputComponentTypes}
                value={selectedNewInputComponentType}
                onChange={(value) => {
                  setSelectedNewInputComponentType(value);
                }}
              />
              <Button
                variant="outline"
                size={'icon'}
                onClick={addInputComponent}
              >
                <PlusIcon />
              </Button>
            </div>
            <div className="flex gap-2">
              {inputComponents.length > 0 && (
                <Button
                  variant={'outline'}
                  onClick={() => {
                    setInputComponents([]);
                  }}
                >
                  Clear input
                </Button>
              )}
              {messages.length > 0 && (
                <Button
                  variant={'outline'}
                  onClick={() => {
                    setMessages([]);
                  }}
                >
                  Clear messages
                </Button>
              )}
              <Button onClick={send}>Send</Button>
            </div>
          </div>
        </div>
      </ScrollArea>
      <Separator />
      <ScrollArea className="h-[300px]">
        <div className="my-2 flex flex-col gap-2">
          {messages.map((message, index) => {
            return (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-[700px] ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-secondary'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: message.content.replaceAll('\n', '<br />'),
                  }}
                ></div>
              </div>
            );
          })}
          {loading && <Skeleton className="h-7 w-[400px]" />}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Ai;
