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

export default function cleanWord(word) {
  word = word.toLowerCase();
  if (customStopwords.has(word)) return null;
  if (word.length <= 2) return null;
  return word;
}