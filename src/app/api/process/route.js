import { NextResponse } from "next/server";
import processColumn from "./processColumn";
import analyser from "./sentimentAnalisis";
import themeExtractor from "./themeExtraction";
import statsCalc from "./statsCalc";
import actionsPredictor from "./actionsPredictor";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { encrypt, decrypt } from "@/lib/crypto";

export async function POST(req) {
  const session = await getServerSession();

  const data = await req.json();
  const fileName = data.fileName
  let apiKey = data.apiKey;
  let dataK = {};

  if(session) {
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email })
    const hasKey = Boolean(user.apikey?.content);

    if (hasKey) {
      apiKey = decrypt(user.apikey);
    }
    else {
      if (!apiKey) {
        throw new Error("API key missing");
      }
      user.apikey = encrypt(apiKey);
      await user.save();
    }
  }

  const infos = [...data.result]; //har ek response ka array[{phele res},{dusra res}....]
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
  const questions = await processColumn(freq,apiKey);
  for (let question of questions) {
    if (question.useful === false) continue;
    if (question.type === "text") {
      question.responses = Object.keys(freq[question.question]);
      question.sentiment = analyser(freq, question);
      question.theme = themeExtractor(freq, question, infos);
      delete question.responses
    }
    if (question.type === "ordered_single_choice") {
      const dist_t = freq[question.question];
      const entries = Object.entries(dist_t);
      //scale here i have the scal in question.scale
      const labelToNumber = {};
      for (let num in question.scale) {
        labelToNumber[question.scale[num]] = Number(num);
      }
      for (let entry in entries) {
        entries[entry][0] = labelToNumber[entries[entry][0]];
      }
      const dist = {};
      for (let entry in dist_t) {
        dist[labelToNumber[entry]] = dist_t[entry];
      }
      question.distribution = dist;

      const [values, stats] = statsCalc(entries);
      // question.values = values;
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
  result.actions = await actionsPredictor(questions, apiKey);
  result.fileName = fileName

  //so now i hve to save the result in db if user is logged in

  return NextResponse.json(result, { status: 200 });
}
