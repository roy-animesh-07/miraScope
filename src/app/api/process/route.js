import { NextResponse } from "next/server";
import processColumn from "./processColumn";
import analyser from "./sentimentAnalisis";
import themeExtractor from "./themeExtraction";
import statsCalc from "./statsCalc";

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
      question.sentiment = analyser(freq,question);
      question.theme = themeExtractor(freq,question,infos);

    }
    if (question.type === "ordered_single_choice") {
      const dist = freq[question.question];
      const entries = Object.entries(dist);
      question.distribution = dist;
      const [values , stats] = statsCalc(entries);
      question.values = values;
      question.stats = stats;
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