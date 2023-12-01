import axios from 'axios';
import secrets from 'secrets';

const openai = {
  createChatCompletions: async (
    messages: any[],
    model = 'gpt-4',
    temperature?: number,
    tools?: any[],
  ) => {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        temperature,
        messages,
        tools,
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
