/* lib/ai.js ----------------------------------------------------------- */
import OpenAI            from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

/* keep a mutable reference so we can swap keys later */
let openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI ?? '',   // may be blank
  dangerouslyAllowBrowser: true,
});

/* call this from the UI when the user types a new key */
export const setApiKey = (key) => {
  if (key && key !== openai.apiKey) {
    openai = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });
  }
};

/* plain chat --------------------------------------------------------- */
export const ask41 = async (prompt, opts = {}) => {
  const { choices } = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [{ role: 'user', content: prompt }],
    ...opts,
  });
  return choices[0]?.message?.content ?? '';
};

/* Zod-validated structured output ----------------------------------- */
export const askZod = async (schema, systemPrompt, userPrompt, opts = {}) => {
  const res = await openai.responses.parse({
    model: 'gpt-4.1',
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   },
    ],
    text: { format: zodTextFormat(schema, 'output') },
    ...opts,
  });
  return res.output_parsed;
};
