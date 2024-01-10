import { Avatar, AvatarImage } from '@/components/ui/avatar';
import React from 'react';

interface UrlItemProps {
  url: string;
  title: string;
}

export default function UrlItem({ url, title }: UrlItemProps) {
  return (
    <div
      className="w-16 text-center overflow-x-hidden hover:font-bold"
      title={title}
    >
      <a
        href={url}
        target="_blank"
        className="text-sm text-black dark:text-gray-200 truncate"
        rel="noreferrer"
      >
        <Avatar className="w-6 h-6 mx-auto">
          <AvatarImage
            src={`chrome-extension://${
              chrome.runtime.id
            }/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`}
            alt=""
          />
        </Avatar>
        {title}
      </a>
    </div>
  );
}
