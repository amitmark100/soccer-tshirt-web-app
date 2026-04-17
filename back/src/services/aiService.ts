import axios from 'axios';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GrokSearchTerms {
  team?: string;
  color?: string;
  year?: string;
  player?: string;
  reasoning: string;
}

export async function generateFilterFromQuery(query: string): Promise<GrokSearchTerms> {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }

    const systemPrompt = `You are a soccer jersey expert. Analyze the user's search query.
    Return ONLY a valid JSON object. No markdown, no backticks, no explanation.
    Format: {"team": "string or null", "color": "string or null", "year": "string or null", "player": "string or null", "reasoning": "one sentence in English"}`;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY.trim()}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseText = response.data.choices[0].message.content;
    return JSON.parse(responseText);

  } catch (error: any) {
    if (error.response && error.response.data) {
      console.error('[AI Search] Groq Detailed Error:', JSON.stringify(error.response.data, null, 2));
    }
    const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
    throw new Error(errorMessage);
  }
}

export function buildMongooseFilter(searchTerms: GrokSearchTerms): Record<string, any> {
  const filter: Record<string, any> = {};

  if (searchTerms.team) {
    filter['jerseyDetails.team'] = { $regex: searchTerms.team, $options: 'i' };
  }

  const searchField = 'description';

  if (searchTerms.color) {
    filter[searchField] = { $regex: searchTerms.color, $options: 'i' };
  }

  if (searchTerms.year) {
    filter[searchField] = filter[searchField]
      ? { ...filter[searchField], $regex: searchTerms.year, $options: 'i' }
      : { $regex: searchTerms.year, $options: 'i' };
  }

  if (searchTerms.player) {
    filter[searchField] = filter[searchField]
      ? { ...filter[searchField], $regex: searchTerms.player, $options: 'i' }
      : { $regex: searchTerms.player, $options: 'i' };
  }

  return filter;
}