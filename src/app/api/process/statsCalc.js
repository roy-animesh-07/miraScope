
export default function statsCalc(entries) {
    
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
    const stats = {
        average: average.toFixed(2),
        median,
        mode,
      };
    return [values,stats]
}