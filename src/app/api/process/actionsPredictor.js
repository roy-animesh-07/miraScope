import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({});

async function aiActions(report_data) {
  const prompt = `
You are an expert product and data analyst.

You are given analyzed survey results extracted from multiple questions.
Each item may include sentiment analysis, themes with quotes, rating statistics,
or categorical distributions.

Your task:
- Identify the most important insights across all questions.
- Generate clear, actionable recommendations based on the data.
- Each recommendation must be practical, specific, and directly tied to the data.
- Assign a confidence score between 0 and 1 based on how strongly the data supports the action.

Guidelines:
- Prioritize negative sentiment and low ratings.
- Repeated themes across multiple questions increase confidence.
- Large skews in distributions indicate strong signals.
- Do NOT repeat the data verbatim; infer actions from it.
- Avoid generic advice like “improve quality” unless justified by data.
- Generate 3 to 5 actions only.

Return ONLY valid JSON.
No explanations. No backticks. No extra text.

Each action must follow this exact format:
{
  "action": "<clear, specific recommendation>",
  "confidence": <number between 0 and 1>
}

Input data:
${JSON.stringify(report_data)}
`;

  // const response = await ai.models.generateContent({
  //   model: "gemini-2.5-flash-lite",
  //   contents: prompt,
  // });

  // return JSON.parse(response.text);
const response = [
{
"action": "Reduce overt sales pitching in sessions and enforce a content guideline where the majority of each talk is educational, with sales material limited to a short dedicated segment.",
"confidence": 0.87
},
{
"action": "Improve physical comfort by upgrading seating and ensuring room temperature is actively monitored and adjusted throughout the event, especially during long afternoon sessions.",
"confidence": 0.82
},
{
"action": "Expand dietary accommodations by adding clearly labeled gluten-free dessert and meal options to all food breaks.",
"confidence": 0.76
},
{
"action": "Double down on high-impact elements by allocating more time and resources to Q&A sessions and structured networking mixers, as these are repeatedly cited highlights.",
"confidence": 0.91
}
]
return JSON.parse(JSON.stringify(response));
}
export default async function actionsPredictor(questions) {
  const report_data = [];
  for (let q of questions) {
    const data = {};
    if (!q.useful) continue;
    data.question = q.question;
    if (q.type === "text") {
      data.sentiment = q.sentiment;
      data.theme = q.theme;
      report_data.push(data);
    } else if (q.type === "ordered_single_choice") {
      data.scale = q.scale;
      data.distribution = q.distribution;
      data.stats = q.stats;
      report_data.push(data);
    } else if (q.type === "categorical_single_choice") {
      data.distribution = q.distribution;
    } else if (q.type === "multi_text") {
      data.distribution = q.distribution;
    }
  }

  const actions = await aiActions(report_data);
  return actions;
}
