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
import React, { useCallback, useEffect, useState } from 'react';
import secrets from 'secrets';
import UrlItem from './url-item';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const getFilteredPages = (
  pages: any[],
  selectedTags: any[],
  orFilter: boolean
) => {
  if (selectedTags.length) {
    return pages.filter((page) => {
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
    });
  } else {
    return pages;
  }
};

export default function NotionBookmark() {
  const [pages, setPages] = useState<any[]>([]);
  const [filteredPages, setFilteredPages] = useState<any[]>([]);
  const [database, setDatabase] = useState<any>();
  const [allTags, setAllTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [orFilter, setOrFilter] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'list'>('list');

  const loadPages = useCallback(async (nextCursor: string | null) => {
    const response = await notion.databases.query({
      database_id: secrets.NOTION_BOOKMARK_DATABASE_ID,
      start_cursor: nextCursor || undefined,
    });
    setPages((prev) => [...prev, ...response.results]);
    if (response.has_more) {
      loadPages(response.next_cursor);
    }
  }, []);

  useEffect(() => {
    const loadDatabase = async () => {
      const response = await notion.databases.retrieve({
        database_id: secrets.NOTION_BOOKMARK_DATABASE_ID,
      });
      setDatabase(response);
      setAllTags((response.properties.Tags as any).multi_select.options);
    };

    loadPages(null);
    loadDatabase();
  }, []);

  useEffect(() => {
    setFilteredPages(getFilteredPages(pages, selectedTags, orFilter));
  }, [pages, selectedTags, orFilter]);

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
              id="view-mode"
              checked={viewMode === 'list'}
              onCheckedChange={(val) => setViewMode(val ? 'list' : 'table')}
            />
            <Label htmlFor="view-mode">
              {viewMode === 'list' ? 'List' : 'Table'}
            </Label>
          </div>
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
              style={{ backgroundColor: color }}
            >
              {name}
            </Badge>
          ))}
        </div>
      )}
      {viewMode === 'list' && (
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
                  title={title
                    .map(({ plain_text }: any) => plain_text)
                    .join(' ')}
                />
              );
            }
          )}
        </div>
      )}
      {viewMode === 'table' && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
                  <TableRow key={id}>
                    <TableCell>
                      {title.map(({ plain_text }: any) => plain_text).join(' ')}
                    </TableCell>
                    <TableCell>
                      <a
                        href={url}
                        target="_blank"
                        className="text-sm text-black dark:text-gray-200 truncate"
                        rel="noreferrer"
                      >
                        {url}
                      </a>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {Tags.multi_select.map(({ name, color }: any) => (
                        <Badge
                          key={name}
                          className="cursor-pointer"
                          style={{ backgroundColor: color }}
                        >
                          {name}
                        </Badge>
                      ))}
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
