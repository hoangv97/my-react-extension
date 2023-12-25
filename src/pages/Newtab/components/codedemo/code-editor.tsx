import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import ReactCodeMirror from '@uiw/react-codemirror';
import React, { useEffect, useState } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { html as langHtml } from '@codemirror/lang-html';
import { css as langCss } from '@codemirror/lang-css';
import { useTheme } from '@/components/theme-provider';

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
      <html>
        <style>
          ${css}
        </style>
        <body>
          ${html}
        </body>
        <script>
          ${js}
        </script>
      </html>
    `);
    }, 250);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  return (
    <div className="w-full h-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel>
              <ReactCodeMirror
                value={html}
                onChange={(val) => setHtml(val)}
                extensions={[langHtml({})]}
                theme={themeMode}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              <ReactCodeMirror
                value={css}
                onChange={(val) => setCss(val)}
                extensions={[langCss()]}
                theme={themeMode}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              <ReactCodeMirror
                value={js}
                onChange={(val) => setJs(val)}
                extensions={[javascript()]}
                theme={themeMode}
              />
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
