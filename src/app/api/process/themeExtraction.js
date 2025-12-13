import cleanWord from "./cleanWord";
export default function themeExtractor(freq,question,infos) {
  const mp = new Map();
  for (let res of question.responses) {
    let words = res
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter(Boolean);
    const currMp = new Map();
    for (let word of words) {
      if (!currMp.has(word)) {
        currMp.set(word, freq[question.question][res]);
        mp.set(word, (mp.get(word) || 0) + freq[question.question][res]);
      } else {
        currMp.set(
          word,
          (currMp.get(word) || 0) + freq[question.question][res]
        );
      }
    }
  }
  const wordScore = {};
  for (let res of question.responses) {
    let words = res
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter(Boolean);
    const currMp = new Map();
    for (let word of words) {
      currMp.set(word, (currMp.get(word) || 0) + 1);
    }
    const wordsf = Object.fromEntries(currMp);
    const uni_words = Object.keys(wordsf);
    for (let word of uni_words) {
      const tf = currMp.get(word) / words.length;
      const idf = Math.log(infos.length / mp.get(word));
      const score = tf * idf * freq[question.question][res];
      if (cleanWord(word)) {
        wordScore[word] = (wordScore[word] || 0) + score;
      }
    }
  }

  const all_themes = Object.entries(wordScore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  const theme = all_themes.map((w) => ({
    theme: w,
    quote: question.responses.find((r) => r.toLowerCase().includes(w)) || "",
  }));
  return theme;
}
