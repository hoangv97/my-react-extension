export const fetchApiWithRetry = async (url, options, retries = 3) => {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    if (retries === 0) {
      console.log('Failed to fetch API', error);
      return null;
    }
    return fetchApiWithRetry(url, options, retries - 1);
  }
};
