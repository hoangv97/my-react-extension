import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const customQuickSetupButtons = [
  {
    type: 'css',
    link: 'https://cdn.tailwindcss.com',
    label: 'Add Tailwind CSS',
    variant: 'secondary',
  },
  {
    type: 'js',
    link: 'https://unpkg.com/react@18/umd/react.development.js',
    label: 'Add React 18 (Dev)',
  },
  {
    type: 'js',
    link: 'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
    label: 'Add ReactDOM 18 (Dev)',
  },
  {
    type: 'js',
    link: 'https://unpkg.com/react@18/umd/react.production.min.js',
    label: 'Add React 18 (Prod)',
  },
  {
    type: 'js',
    link: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    label: 'Add ReactDOM 18 (Prod)',
  },
];

export interface SettingsDataProps {
  html: {
    className: string;
    bodyClassName: string;
    headTags: string;
  };
  css: {
    externalLinks: string[];
  };
  js: {
    externalLinks: string[];
  };
}

interface SettingsProps {
  data: SettingsDataProps;
  onChange: (data: SettingsDataProps) => void;
}

export default function Settings({ data, onChange }: SettingsProps) {
  const [open, setOpen] = useState(false);

  const [html, setHtml] = useState({
    ...data.html,
  });
  const [css, setCss] = useState({
    ...data.css,
  });
  const [js, setJs] = useState({
    ...data.js,
  });

  useEffect(() => {
    setHtml({
      ...data.html,
    });
    setCss({
      ...data.css,
      externalLinks: data.css.externalLinks.filter((link) => link !== ''),
    });
    setJs({
      ...data.js,
      externalLinks: data.js.externalLinks.filter((link) => link !== ''),
    });
  }, [data]);

  const save = () => {
    onChange({
      html,
      css,
      js,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogTrigger asChild>
        <Button size="sm" onClick={() => setOpen(true)}>
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Code Settings</DialogTitle>
          <DialogDescription>Make changes to your code here.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="html">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quick_setup">Quick setup</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="js">JS</TabsTrigger>
          </TabsList>
          <TabsContent value="html">
            <Card>
              <CardContent className="space-y-2 mt-4">
                <div className="space-y-1">
                  <Label htmlFor="htmlClassName">
                    Add Class(es) to {'<html>'}
                  </Label>
                  <Input
                    id="htmlClassName"
                    value={html.className}
                    onChange={(e) =>
                      setHtml((prev) => ({
                        ...prev,
                        className: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="htmlBodyClassName">
                    Add Class(es) to {'<body>'}
                  </Label>
                  <Input
                    id="htmlBodyClassName"
                    value={html.bodyClassName}
                    onChange={(e) =>
                      setHtml((prev) => ({
                        ...prev,
                        bodyClassName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="htmlHeadTags">Stuff for {'<head>'}</Label>
                  <Textarea
                    id="htmlHeadTags"
                    value={html.headTags}
                    onChange={(e) =>
                      setHtml((prev) => ({
                        ...prev,
                        headTags: e.target.value,
                      }))
                    }
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setHtml((prev) => ({
                        ...prev,
                        headTags: `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n${prev.headTags}`,
                      }));
                    }}
                  >
                    Insert common viewport meta tag
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="css">
            <Card>
              <CardContent className="space-y-2 mt-4">
                <div className="space-y-1 flex flex-col gap-2">
                  <Label htmlFor="cssExternalLinks">
                    Add External Stylesheets
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Any URLs added here will be added as {'<link>'}s in order,
                    and before the CSS in the editor.
                  </p>
                  {css.externalLinks.map((link, i) => (
                    <div className="flex gap-2" key={link + i}>
                      <Input
                        id={`cssExternalLinks-${i}`}
                        value={link}
                        placeholder="https://example.com/style.css"
                        onChange={(e) =>
                          setCss((prev) => ({
                            ...prev,
                            externalLinks: prev.externalLinks.map((l, j) =>
                              i === j ? e.target.value : l
                            ),
                          }))
                        }
                      />
                      <Button
                        size="icon"
                        variant={'ghost'}
                        onClick={() => {
                          setCss((prev) => ({
                            ...prev,
                            externalLinks: prev.externalLinks.filter(
                              (_, j) => i !== j
                            ),
                          }));
                        }}
                      >
                        <XIcon />
                      </Button>
                    </div>
                  ))}
                  <div>
                    <Button
                      size="sm"
                      onClick={() =>
                        setCss((prev) => ({
                          ...prev,
                          externalLinks: [...prev.externalLinks, ''],
                        }))
                      }
                    >
                      Add another resource
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="js">
            <Card>
              <CardContent className="space-y-2 mt-4">
                <div className="space-y-1 flex flex-col gap-2">
                  <Label htmlFor="cssExternalLinks">Add External Scripts</Label>
                  <p className="text-sm text-muted-foreground">
                    Any URL's added here will be added as {'<script>'}s in
                    order, and run before the JavaScript in the editor.
                  </p>
                  {js.externalLinks.map((link, i) => (
                    <div className="flex gap-2" key={link + i}>
                      <Input
                        id={`jsExternalLinks-${i}`}
                        value={link}
                        placeholder="https://example.com/script.js"
                        onChange={(e) =>
                          setJs((prev) => ({
                            ...prev,
                            externalLinks: prev.externalLinks.map((l, j) =>
                              i === j ? e.target.value : l
                            ),
                          }))
                        }
                      />
                      <Button
                        size="icon"
                        variant={'ghost'}
                        onClick={() => {
                          setJs((prev) => ({
                            ...prev,
                            externalLinks: prev.externalLinks.filter(
                              (_, j) => i !== j
                            ),
                          }));
                        }}
                      >
                        <XIcon />
                      </Button>
                    </div>
                  ))}
                  <div>
                    <Button
                      size="sm"
                      onClick={() =>
                        setJs((prev) => ({
                          ...prev,
                          externalLinks: [...prev.externalLinks, ''],
                        }))
                      }
                    >
                      Add another resource
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="quick_setup">
            <Card>
              <CardContent className="space-y-2 mt-4">
                <div className="space-y-1 flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    This will add the following resources to your code:
                  </p>
                  <div className="flex flex-col items-start gap-2">
                    {customQuickSetupButtons.map((button, i) => (
                      <div key={button.link}>
                        <Button
                          size="sm"
                          variant={(button.variant as any) || undefined}
                          onClick={() => {
                            if (button.type === 'css') {
                              setCss((prev) => ({
                                ...prev,
                                externalLinks: [
                                  ...prev.externalLinks,
                                  button.link,
                                ],
                              }));
                            } else if (button.type === 'js') {
                              setJs((prev) => ({
                                ...prev,
                                externalLinks: [
                                  ...prev.externalLinks,
                                  button.link,
                                ],
                              }));
                            }
                          }}
                        >
                          {button.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button type="submit" onClick={save}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
