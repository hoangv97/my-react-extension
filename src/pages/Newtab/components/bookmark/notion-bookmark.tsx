import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { notion } from '@/lib/notion';
import React, { useEffect, useState } from 'react';
import secrets from 'secrets';
import UrlItem from './url-item';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function NotionBookmark() {
  const [pages, setPages] = useState<any[]>([]);
  const [filteredPages, setFilteredPages] = useState<any[]>([]);
  const [database, setDatabase] = useState<any>();
  const [allTags, setAllTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [orFilter, setOrFilter] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      const response = await notion.databases.query({
        database_id: secrets.NOTION_BOOKMARK_DATABASE_ID,
      });
      setPages(response.results);
      setFilteredPages(response.results);
    };

    const loadDatabase = async () => {
      const response = await notion.databases.retrieve({
        database_id: secrets.NOTION_BOOKMARK_DATABASE_ID,
      });
      setDatabase(response);
      setAllTags((response.properties.Tags as any).multi_select.options);
    };

    loadPages();
    loadDatabase();
  }, []);

  useEffect(() => {
    if (selectedTags.length) {
      setFilteredPages(
        pages.filter((page) => {
          const pageTags = (page.properties.Tags as any).multi_select;
          if (orFilter) {
            return selectedTags.some((tag) =>
              pageTags.find((t: any) => t.id === tag.id)
            );
          } else {
            return selectedTags.every((tag) =>
              pageTags.find((t: any) => t.id === tag.id)
            );
          }
        })
      );
    } else {
      setFilteredPages(pages);
    }
  }, [selectedTags, orFilter]);

  return (
    <div className="mt-6">
      <a
        className="text-xl hover:text-blue-500"
        href={`https://notion.so/${secrets.NOTION_BOOKMARK_DATABASE_ID}`}
        target="_blank"
        rel="noreferrer"
      >
        Bookmarks
      </a>
      {!!database && (
        <div className="flex gap-2 items-center my-2">
          <div className="flex items-center space-x-2 mr-4">
            <Switch
              id="or-filter"
              checked={orFilter}
              onCheckedChange={(val) => setOrFilter(val)}
            />
            <Label htmlFor="or-filter">{orFilter ? 'OR' : 'AND'}</Label>
          </div>
          <Select
            onValueChange={(val) => {
              setSelectedTags((prev) => [
                ...prev,
                allTags.find((t) => t.id === val),
              ]);
            }}
          >
            <SelectTrigger className="w-[150px] h-[30px]">
              <SelectValue placeholder="Select a tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tags</SelectLabel>
                {allTags.map(({ id, name, color }: any) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {selectedTags.map(({ name, color, id }) => (
            <Badge
              key={id}
              onClick={() => {
                setSelectedTags((prev) => prev.filter((t) => t.id !== id));
              }}
              className="cursor-pointer"
            >
              {name}
            </Badge>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1 mt-4 gap-y-5">
        {filteredPages.map(
          ({
            id,
            properties: {
              Link: { url },
              Name: { title },
              Tags,
            },
          }) => {
            return (
              <UrlItem
                key={id}
                url={url}
                title={title.map(({ plain_text }: any) => plain_text).join(' ')}
              />
            );
          }
        )}
      </div>
    </div>
  );
}
