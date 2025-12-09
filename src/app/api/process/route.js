import { NextResponse } from "next/server";
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
  console.log(prompt);
  const response = [
    { question: "Timestamp", type: "timestamp" },
    {
      question: "What is the name of the movie you are reviewing?",
      type: "text",
    },
    { question: "On which date did you watch this movie?", type: "timestamp" },
    { question: "What time did the movie viewing begin?", type: "timestamp" },
    {
      question: "How long was the movie's total running time?",
      type: "duration",
    },
    {
      question: "Overall, how would you rate this movie?",
      type: "ordered_single_choice",
    },
    {
      question: "How did you feel about the acting quality?",
      type: "ordered_single_choice",
    },
    {
      question:
        "Which genres best describe this movie? (Select all that apply)",
      type: "multi_choice",
    },
    {
      question: "Who was your favorite character in the movie?",
      type: "categorical_single_choice",
    },
    {
      question:
        "If you selected 'Other' above, please specify your favorite character's role.",
      type: "text",
    },
    {
      question: "Would you recommend this movie to a friend?",
      type: "ordered_single_choice",
    },
    {
      question:
        "Rate the following aspects of the movie: [Story/Plot Originality]",
      type: "ordered_single_choice",
    },
    {
      question:
        "Rate the following aspects of the movie: [Visual Effects (VFX)]",
      type: "ordered_single_choice",
    },
    {
      question: "Rate the following aspects of the movie: [Soundtrack/Score]",
      type: "ordered_single_choice",
    },
    {
      question: "Rate the following aspects of the movie: [Pacing/Editing]",
      type: "ordered_single_choice",
    },
    {
      question:
        "Which elements did you find compelling and/or disappointing? [Action Scenes]",
      type: "multi_choice",
    },
    {
      question:
        "Which elements did you find compelling and/or disappointing? [Dialogue]",
      type: "multi_choice",
    },
    {
      question:
        "Which elements did you find compelling and/or disappointing? [Costume Design]",
      type: "multi_choice",
    },
    {
      question:
        "Which elements did you find compelling and/or disappointing? [Cinematography (Camera work)]",
      type: "multi_choice",
    },
    {
      question: "Share your overall review and final comments on the movie.",
      type: "text",
    },
  ];

  return JSON.parse(JSON.stringify(response));
}

async function processColumn(freq) {
  return await qtypebygpt(freq);
}

export async function POST(req) {
  const data = await req.json();
  const infos = [...data.result];
  const freq = {};
  for (let key in infos[0]) {
    const mp = new Map();
    for (let info of infos) {
      mp.set(info[key], (mp.get(info[key]) || 0) + 1);
    }
    freq[key] = Object.fromEntries(mp);
  }
  const result = {};
  const questions = await processColumn(freq);
  for (let question of questions) {
    if (question.type === "text") {
      question.responses = Object.keys(freq[question.question]);
      question.sentiment = {
        positive: 5,
        neutral: 1,
        negative: 0,
      };
      question.theme = [
        { theme: "qwert1", quote: "ksfjkdjf" },
        { theme: "qwert2", quote: "ksfjkdjf" },
        { theme: "qwert3", quote: "ksfjkdjf" },
      ];
    }
    if (question.type === "ordered_single_choice") {
      const dist = freq[question.question];
      const entries = Object.entries(dist);

      const values = [];
      for (const [value, count] of entries) {
        for (let i = 0; i < count; i++) values.push(Number(value));
      }

      values.sort((a, b) => a - b);

      const total = values.reduce((sum, n) => sum + n, 0);
      const average = total / values.length;

      const median = values[Math.floor(values.length / 2)];

      let mode = null,
        bestCount = -1;
      for (const [value, count] of entries) {
        if (count > bestCount) (mode = Number(value)), (bestCount = count);
      }

      question.distribution = dist;
      question.values = values;
      question.stats = {
        average: average.toFixed(2),
        median,
        mode,
      };
    }

    if (question.type === "categorical_single_choice") {
      const dist = freq[question.question];

      const entries = Object.entries(dist);
      entries.sort((a, b) => b[1] - a[1]);

      question.distribution = dist;
      question.top_values = entries
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }));
      question.values = Object.keys(dist);
    }

    if (question.type === "multi_choice") {
      const exploded = {};

      for (let key in freq[question.question]) {
        const count = freq[question.question][key];
        const items = key
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);

        for (let item of items) {
          exploded[item] = (exploded[item] || 0) + count;
        }
      }

      question.distribution = exploded;

      question.top_values = Object.entries(exploded)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }));

      question.values = Object.keys(exploded);
    }
  }
  result.questions = questions;

  return NextResponse.json(result, { status: 200 });
}
