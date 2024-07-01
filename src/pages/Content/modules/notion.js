import secrets from 'secrets';
import { fetchApiWithRetry } from './api';

const notionApi = `${secrets.CORS_PROXY}https://api.notion.com/v1`;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${secrets.NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
};

export const createDatabase = async (pageId, title, properties) => {
  const result = await fetchApiWithRetry(`${notionApi}/databases`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: {
        type: 'page_id',
        page_id: pageId,
      },
      title: [
        {
          type: 'text',
          text: {
            content: title,
          },
        },
      ],
      properties,
    }),
  });
  return result;
};

export const queryDatabase = async (
  database_id,
  filter = undefined,
  sorts = undefined,
  start_cursor = undefined,
  page_size = 100
) => {
  const result = await fetchApiWithRetry(
    `${notionApi}/databases/${database_id}/query`,
    {
      headers,
      method: 'POST',
      body: JSON.stringify({
        filter,
        sorts,
        start_cursor,
        page_size,
      }),
    }
  );
  return result;
};

export const createPage = async (
  parent,
  properties,
  children,
  icon = undefined,
  cover = undefined
) => {
  // if children length is more than 100, split into multiple requests
  const firstChunk = children.slice(0, 100);
  const result = await fetchApiWithRetry(`${notionApi}/pages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent,
      properties,
      children: firstChunk,
      icon,
      cover,
    }),
  });
  if (children.length > 100) {
    // append block each 100 children
    const restChunks = children.slice(100);
    await appendBlockChildren(result.id, restChunks);
  }
  return result;
};

export const appendBlockChildren = async (block_id, children) => {
  // save children in chunks of 50
  const chunkSize = 50;
  const chunks = [];
  for (let i = 0; i < children.length; i += chunkSize) {
    chunks.push(children.slice(i, i + chunkSize));
  }
  // append each chunk
  for (const chunk of chunks) {
    await fetchApiWithRetry(`${notionApi}/blocks/${block_id}/children`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        children: chunk,
      }),
    });
  }
};

export const updatePage = async (
  page_id,
  properties,
  in_trash = undefined,
  icon = undefined,
  cover = undefined
) => {
  const result = await fetchApiWithRetry(`${notionApi}/pages/${page_id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      properties,
      in_trash,
      icon,
      cover,
    }),
  });
  return result;
};

export const getBlockChildren = async (block_id) => {
  const result = await fetchApiWithRetry(
    `${notionApi}/blocks/${block_id}/children`,
    {
      headers,
    }
  );
  return result;
};

export const getAllBlockChildren = async (block_id) => {
  let blockChildren = [];
  let next_cursor = undefined;
  do {
    // encoding params
    const params = new URLSearchParams();
    if (next_cursor) {
      params.append('start_cursor', next_cursor);
    }
    params.append('page_size', 100);
    const result = await fetchApiWithRetry(
      `${notionApi}/blocks/${block_id}/children?${encodeURIComponent(
        params.toString()
      )}`,
      {
        headers,
      }
    );
    blockChildren = blockChildren.concat(result.results);
    next_cursor = result.next_cursor;
  } while (next_cursor);
  return blockChildren;
};

// if each paragraph splitted by new line
// if longer than 2000 chars, split into multiple paragraphs by dot
export const splitParagraphs = (text) => {
  const maxChars = 2000;
  return text
    .split('\n')
    .map((c) => c.trim())
    .filter((c) => !!c)
    .map((c) => {
      if (c.length <= maxChars) {
        return c;
      }
      const sentences = c.split('.').map((s) => s.trim());
      let current = '';
      let result = [];
      for (let i = 0; i < sentences.length; i++) {
        if (current.length + sentences[i].length < maxChars) {
          current += sentences[i] + '.';
        } else {
          if (current.length > maxChars) {
            // split into 2 paragraphs
            result.push(current.slice(0, maxChars));
            result.push(current.slice(maxChars));
          } else {
            result.push(current);
          }

          current = sentences[i] + '.';
        }
      }
      if (current.length > maxChars) {
        // split into 2 paragraphs
        result.push(current.slice(0, maxChars));
        result.push(current.slice(maxChars));
      } else {
        result.push(current);
      }
      return result;
    })
    .flat();
};
