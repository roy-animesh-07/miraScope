import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
// import {vader} from "vader-sentiment"
const vader = require('vader-sentiment');
const customStopwords = new Set([
  "the","is","are","was","were","am","i","you","we","they","he","she","it",
  "and","or","but","if","in","on","at","to","for","of","a","an",
  "this","that","those","these","with","from","as","by","be","been","being",
  "had","has","have","having",
  "very","really","also","just","so","too","not","only","quite","pretty",
  "do","does","did","doing","done",
  "can","could","should","would","will","may","might","must","shall",
  "there","here","where","when","how","why","what","which","who","whom",
  "all","any","each","every","both","few","many","most","some","such",
  "nothing","none","something","everything","anything",
  "specific","generally","general","overall",
  "good","great","better","best","nice","fine","okay","ok","well",
  "amazing","awesome","perfect",
  "easy","hard","difficult","simple","big","small","new","old","early","late",
  "first","last","next",
  "day","time","thing","things","stuff","place","area","part","lot","bit",
  "kind","type","way",
  "want","wanted","wants",
  "need","needs","needed",
  "like","likes","liked",
  "love","loved",
  "hate","hated",
  "come","comes","came",
  "go","goes","went",
  "get","gets","got","getting",
  "make","makes","made",
  "give","gives","gave","given",
  "take","takes","took","taken",
  "provide","provides","provided","providing",
  "say","says","said",
  "tell","tells","told",
  "think","thinks","thought",
  "feel","feels","felt",
  "seem","seems","seemed",
  "look","looks","looked",
  "see","sees","saw","seen",
  "use","uses","used","using",
  "event","session","experience","activity","program","meeting","workshop",
  "more","less","enough","lots","plenty","several",
  "about","around","along","across","through","throughout","during","while",
  "against",
  "somehow","somewhat","somewhere","sometimes",
  "yes","no","maybe","sure","please","thanks","thank","appreciated",
  "however","therefore","although","though","even","yet","still",
  "because","since","unless","until",
  
  // your new removable junk words seen in output
  "mind","comes","would","should","could","all","there","about","needs"
]);

function cleanWord(word) {
  word = word.toLowerCase();
  if (customStopwords.has(word)) return null;
  if (word.length <= 2) return null;
  return word;
}
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

async function processColumn(freq) {
  return await qtypebygpt(freq);
}

export async function POST(req) {
  const data = await req.json();
  const infos = [...data.result];//har ek response ka array[{phele res},{dusra res}....]
  //info[0] is a obj
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
      let pos = 0,neg =0,net =0;
      const mp = new Map();
      for(let res of question.responses) {
        const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(res);
        if(intensity.compound>=0.05) pos+=freq[question.question][res];
        else if(intensity.compound>=-0.05) net+=freq[question.question][res];
        else neg+=freq[question.question][res];

        let words = res.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ").filter(Boolean);
        const currMp = new Map();
        for(let word of words) {
          if(!currMp.has(word)) {
            currMp.set(word,freq[question.question][res]);
            mp.set(word,(mp.get(word) || 0) + freq[question.question][res]);
          }
          else {
            currMp.set(word,(currMp.get(word) || 0) + freq[question.question][res]);
          }
        }
      }
      const wordScore = {};
      for(let res of question.responses) {
        let words = res.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ").filter(Boolean);
        const currMp = new Map();
        for(let word of words) {
            currMp.set(word,(currMp.get(word) || 0) + 1);
        }
        const wordsf = Object.fromEntries(currMp);
        const uni_words = Object.keys(wordsf);
        for(let word of uni_words) {
          const tf = currMp.get(word) / (words.length);
          const idf = Math.log((infos.length)/(mp.get(word)));
          const score = tf*idf * freq[question.question][res];
          if(cleanWord(word)){
            wordScore[word] = (wordScore[word]||0) + score;
          }
          
        }
      }
      const all_themes = Object.entries(wordScore)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([word]) => word);
      question.theme = all_themes.map(w => ({
      theme: w,
      quote: question.responses.find(r => r.toLowerCase().includes(w)) || ""
    }));

      question.sentiment = {
        positive: pos,
        neutral: net,
        negative: neg,
      };
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
