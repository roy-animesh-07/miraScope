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
Your task is to classify each question and extract useful metadata for analysis.

Question types:
1. ordered_single_choice
2. categorical_single_choice
3. multi_choice
4. text
5. timestamp
6. duration

Rules for type:
- Numeric or ordered labels → ordered_single_choice
- Categories → categorical_single_choice
- Multiple selections → multi_choice
- Sentences or descriptive text → text
- Recognizable timestamps → date and time, or only date, or only time
- Recognizable duration → duration (how much time)

Rules for usefulness:
- Mark "useful": false if the question is only metadata or system-related
  (e.g. Timestamp, processed, response id, internal flags).
- Mark "useful": false for file uploads, links, or proof-only fields.
- Mark "useful": true if the question can provide insights such as
  ratings, preferences, opinions, distributions, sentiment, or trends.
- If unsure, default to useful: false.

Rules for scale:
- If type is ordered_single_choice, generate an ordered scale mapping.
- The scale must be in logical increasing order (lowest → highest).
- Use numbers starting from 1.
- If sample values are numeric, map them directly (e.g. "1" → 1).
- If sample values are text (e.g. Poor, Fair, Good, Excellent), infer the correct order.
- If scale cannot be confidently inferred, return null.

Return ONLY a valid JSON array.
No explanation. No backticks.

Each item must be exactly:
{
  "question": "<same question>",
  "type": "<one of the labels>",
  "useful": true | false,
  "scale": { "1": "<label>", "2": "<label>", ... } | null
}

Data:
${JSON.stringify(questionsArr)}
`;


  // const response = await ai.models.generateContent({
  //   model: "gemini-2.5-flash-lite",
  //   contents: prompt,
  // });

  // return JSON.parse(response.text);
  // console.log(prompt);
  const response = [
  {
    "question": "Timestamp",
    "type": "timestamp",
    "useful": false,
    "scale": null
  },
  {
    "question": "Email Address",
    "type": "text",
    "useful": false,
    "scale": null
  },
  {
    "question": "Full Name",
    "type": "text",
    "useful": false,
    "scale": null
  },
  {
    "question": "Overall Satisfaction (1-5)",
    "type": "ordered_single_choice",
    "useful": true,
    "scale": {
      "1": "1",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5"
    }
  },
  {
    "question": "Statement: \"The event met my expectations\"",
    "type": "ordered_single_choice",
    "useful": true,
    "scale": {
      "1": "Strongly Disagree",
      "2": "Disagree",
      "3": "Neutral",
      "4": "Agree",
      "5": "Strongly Agree"
    }
  },
  {
    "question": "What did you like most?",
    "type": "text",
    "useful": true,
    "scale": null
  },
  {
    "question": "What could be improved?",
    "type": "text",
    "useful": true,
    "scale": null
  },
  {
    "question": "Would you attend next year?",
    "type": "ordered_single_choice",
    "useful": true,
    "scale": {
      "1": "No",
      "2": "Maybe",
      "3": "Yes"
    }
  },
  {
    "question": "How did you hear about us?",
    "type": "categorical_single_choice",
    "useful": true,
    "scale": null
  }
]



  return JSON.parse(JSON.stringify(response));
}

export default async function processColumn(freq) {
  return await qtypebygpt(freq);
}