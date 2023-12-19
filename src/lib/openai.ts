import axios from 'axios';
import secrets from 'secrets';

const openai = {
  createChatCompletions: async (requestBody: any) => {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        ...requestBody
      },
      {
        headers: {
          Authorization: `Bearer ${secrets.OPENAI_API_KEY}`,
        },
      }
    );
    return response.data;
  },
};

export default openai;
