import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: String(process.env.GEMINI_API_KEY) });

async function main() {
   
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

export default async function processData(data) {
    console.log(process.env.GITHUB_ID);
    const infos = [...data.result]
    // console.log(infos[0])
    // await main();
    for (let key in infos[0]) {
        const col = [];
        const mp = new Map();
        for(let info of infos) {
            mp.set(info[key], (mp.get(info[key]) || 0) + 1);
        }
        // console.log(mp);
    }
    return data;
}