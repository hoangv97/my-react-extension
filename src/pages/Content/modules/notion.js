import secrets from 'secrets';

const notionApi = `${secrets.CORS_PROXY}https://api.notion.com/v1`;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${secrets.NOTION_API_KEY}`,
  'Notion-Version': '2022-06-28',
};

const fetchApiWithRetry = async (url, options, retries = 3) => {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return response;
    }
  } catch (error) {
    if (retries === 0) {
      console.log('Failed to fetch API', error);
      return null;
    }
    return fetchApiWithRetry(url, options, retries - 1);
  }
};

export const queryDatabase = async (
  database_id,
  filter = undefined,
  sorts = undefined,
  start_cursor = undefined,
  page_size = 100
) => {
  const response = await fetchApiWithRetry(
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
  const results = await response.json();
  return results;
};

export const createPage = async (database_id, properties, children) => {
  const response = await fetchApiWithRetry(`${notionApi}/pages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent: {
        database_id,
      },
      properties,
      children,
    }),
  });
  const result = await response.json();
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

export const updatePage = async (page_id, properties) => {
  const response = await fetchApiWithRetry(`${notionApi}/pages/${page_id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      properties,
    }),
  });
  const result = await response.json();
  return result;
};

export const getBlockChildren = async (block_id) => {
  const response = await fetchApiWithRetry(
    `${notionApi}/blocks/${block_id}/children`,
    {
      headers,
    }
  );
  const { results } = await response.json();
  return results;
};
