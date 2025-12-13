import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});

async function qtypebygpt(freq) {
  const questionsArr = [];

  for (let key in freq) {
    const five_unique_values = Object.keys(freq[key]).slice(
      0,
      Math.min(5, Object.keys(freq[key]).length)
    );
    questionsArr.push({
      question: key,
      samples: five_unique_values,
    });
  }

  const prompt = `
  You are a data-analysis engine for survey forms. 
  Your task is to classify each question into one of these types:

  1. ordered_single_choice
  2. categorical_single_choice
  3. multi_choice
  4. text
  5. timestamp
  6. duration

  Rules:
  - Numeric or ordered labels → ordered_single_choice
  - Categories → categorical_single_choice
  - Multiple selections → multi_choice
  - Sentences → text
  - Recognizable timestamps → like date and time or only date or only time
  - Recognizable duration → duration (how much time)

  Return ONLY valid JSON array, no explanation, no backticks.
  Each item must be:
  {
    "question": "<same question>",
    "type": "<one of the labels>"
  }

  Data:
  ${JSON.stringify(questionsArr)}
  `;
  // const response = await ai.models.generateContent({
  //   model: "gemini-2.5-flash-lite",
  //   contents: prompt,
  // });

  // return JSON.parse(response.text());
  // console.log(prompt);
  const response = [
  {
    "question": "Timestamp",
    "type": "timestamp"
  },
  {
    "question": "Email Address",
    "type": "text"
  },
  {
    "question": "Full Name",
    "type": "text"
  },
  {
    "question": "Overall Satisfaction (1-5)",
    "type": "ordered_single_choice"
  },
  {
    "question": "Statement: \"The event met my expectations\"",
    "type": "categorical_single_choice"
  },
  {
    "question": "What did you like most?",
    "type": "text"
  },
  {
    "question": "What could be improved?",
    "type": "text"
  },
  {
    "question": "Would you attend next year?",
    "type": "categorical_single_choice"
  },
  {
    "question": "How did you hear about us?",
    "type": "categorical_single_choice"
  }
];

  return JSON.parse(JSON.stringify(response));
}

export default async function processColumn(freq) {
  return await qtypebygpt(freq);
}