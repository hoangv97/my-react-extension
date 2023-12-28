import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { css as langCss } from '@codemirror/lang-css';
import { html as langHtml } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import ReactCodeMirror from '@uiw/react-codemirror';
import React, { useEffect, useState } from 'react';
import Settings, { SettingsDataProps } from './settings';

export default function CodeEditor() {
  const { theme } = useTheme();

  const getCurrentTheme = () => {
    return document.documentElement.className.includes('dark')
      ? 'dark'
      : 'light';
  };

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    getCurrentTheme()
  );

  useEffect(() => {
    setThemeMode(getCurrentTheme());
  }, [theme]);

  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [srcDoc, setSrcDoc] = useState('');
  const [settings, setSettings] = useState<SettingsDataProps>({
    html: {
      className: '',
      bodyClassName: '',
      headTags: '',
    },
    css: {
      externalLinks: [''],
    },
    js: {
      externalLinks: [''],
    },
  });
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
      <html class="${settings.html.className}">
        <head>
          ${settings.html.headTags}
          ${settings.css.externalLinks
            .filter((link) => link)
            .map((link) => `<link rel="stylesheet" href="${link}" />`)
            .join('')}
          <style>${css}</style>
        </head>
        <body class="${settings.html.bodyClassName}">
          ${html}
          ${settings.js.externalLinks
            .filter((link) => link)
            .map((link) => `<script crossorigin src="${link}"></script>`)
            .join('')}
          <script>${js}</script>
        </body>
      </html>
    `);
    }, 250);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  return (
    <div className="w-full h-full">
      <div className="flex justify-end gap-2 mb-2">
        <Settings
          data={settings}
          onChange={(val) => {
            setSettings(val);
          }}
        />
        <Button
          size="sm"
          onClick={() => {
            setLayout(layout === 'horizontal' ? 'vertical' : 'horizontal');
          }}
        >
          Layout: {layout}
        </Button>
      </div>
      <ResizablePanelGroup direction={layout}>
        <ResizablePanel>
          <ResizablePanelGroup
            direction={layout === 'horizontal' ? 'vertical' : 'horizontal'}
          >
            <ResizablePanel>
              <div className="h-full pb-1 pr-1">
                <div>HTML</div>
                <ReactCodeMirror
                  className="h-full"
                  height="100%"
                  value={html}
                  onChange={(val) => setHtml(val)}
                  extensions={[langHtml({})]}
                  theme={themeMode}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              <div className="h-full pb-1 pr-1">
                <div>CSS</div>
                <ReactCodeMirror
                  className="h-full"
                  height="100%"
                  value={css}
                  onChange={(val) => setCss(val)}
                  extensions={[langCss()]}
                  theme={themeMode}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              <div
                className={`h-full pb-1 ${
                  layout === 'horizontal' ? 'pr-1' : ''
                }`}
              >
                <div>JS</div>
                <ReactCodeMirror
                  className="h-full"
                  height="100%"
                  value={js}
                  onChange={(val) => setJs(val)}
                  extensions={[javascript()]}
                  theme={themeMode}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel className="bg-white">
          <iframe title="result" srcDoc={srcDoc} className="w-full h-full" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
