import { DataRow, FrequencyItem, SummaryStats, TargetComparisonStats, GroupingMode, SortOrder } from '../types';

/**
 * Parses raw text into a number, supporting comma and dot decimals
 */
export function parseNumericValue(raw: string): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  // Remove currency prefix like R$, $, € or units
  const sanitized = trimmed
    .replace(/[R$€£]/g, '')
    .replace(/\s+/g, '')
    // If it contains both comma and dot, e.g. 1.234,56 (BR standard)
    .replace(/\.(?=\d{3}(,|$))/g, '')
    // Replace comma with dot
    .replace(',', '.');

  const num = Number(sanitized);
  return isNaN(num) ? null : num;
}

/**
 * Split clipboard or bulk string into individual values
 */
export function parsePastedText(text: string): string[] {
  if (!text) return [];

  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // If text contains newlines or tabs (typical Excel paste), split by newline or tab
  if (normalized.includes('\n') || normalized.includes('\t')) {
    const rawLines = normalized.split(/[\n\t]+/);
    return rawLines
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  // If text is comma or semicolon separated on a single line
  if (normalized.includes(';') || normalized.includes(',')) {
    // Check if comma is used as decimal separator vs item separator
    if (normalized.includes(';')) {
      return normalized.split(';').map(s => s.trim()).filter(s => s.length > 0);
    }
    // If multiple commas, e.g. "10, 20, 30, 40"
    const items = normalized.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (items.length > 1) {
      return items;
    }
  }

  // Space-separated
  const spaced = normalized.split(/\s+/).map(s => s.trim()).filter(s => s.length > 0);
  return spaced.length > 0 ? spaced : [text.trim()];
}

/**
 * Computes all descriptive statistics
 */
export function calculateStatistics(rows: DataRow[]): SummaryStats {
  const validNumbers: number[] = [];
  let invalidCount = 0;

  for (const row of rows) {
    if (row.rawValue.trim() === '') {
      continue;
    }
    if (row.numericValue !== null) {
      validNumbers.push(row.numericValue);
    } else {
      invalidCount++;
    }
  }

  const count = validNumbers.length;
  const totalRows = rows.filter(r => r.rawValue.trim() !== '').length;

  if (count === 0) {
    return {
      mean: null,
      median: null,
      modes: [],
      count: 0,
      totalRows,
      invalidCount,
      sum: null,
      min: null,
      max: null,
      range: null,
      variance: null,
      stdDev: null,
      q1: null,
      q3: null,
      iqr: null,
    };
  }

  // Sorted copy
  const sorted = [...validNumbers].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;

  // Min, Max, Range
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  // Median
  let median: number;
  const mid = Math.floor(count / 2);
  if (count % 2 === 0) {
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    median = sorted[mid];
  }

  // Mode(s)
  const freqMap = new Map<number, number>();
  let maxFreq = 0;
  for (const n of sorted) {
    const f = (freqMap.get(n) || 0) + 1;
    freqMap.set(n, f);
    if (f > maxFreq) maxFreq = f;
  }

  const modes: number[] = [];
  if (maxFreq > 1) {
    for (const [val, freq] of freqMap.entries()) {
      if (freq === maxFreq) {
        modes.push(val);
      }
    }
  }

  // Variance & Standard Deviation (Sample)
  let variance: number | null = null;
  let stdDev: number | null = null;
  if (count > 1) {
    const sumSquaredDiff = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    variance = sumSquaredDiff / (count - 1);
    stdDev = Math.sqrt(variance);
  } else if (count === 1) {
    variance = 0;
    stdDev = 0;
  }

  // Quartiles
  const q1 = getPercentile(sorted, 0.25);
  const q3 = getPercentile(sorted, 0.75);
  const iqr = q1 !== null && q3 !== null ? q3 - q1 : null;

  return {
    mean,
    median,
    modes: modes.sort((a, b) => a - b),
    count,
    totalRows,
    invalidCount,
    sum,
    min,
    max,
    range,
    variance,
    stdDev,
    q1,
    q3,
    iqr,
  };
}

function getPercentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  if (sorted.length === 1) return sorted[0];
  const index = p * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Calculates frequency distribution for the chart
 */
export function calculateFrequencyDistribution(
  rows: DataRow[],
  mode: GroupingMode = 'exact',
  binCount?: number,
  sortOrder: SortOrder = 'value_asc'
): FrequencyItem[] {
  const validNumbers = rows
    .map(r => r.numericValue)
    .filter((n): n is number => n !== null);

  const total = validNumbers.length;
  if (total === 0) return [];

  let items: { value: number; label: string; count: number }[] = [];

  if (mode === 'exact') {
    // Exact discrete values
    const map = new Map<number, number>();
    for (const val of validNumbers) {
      map.set(val, (map.get(val) || 0) + 1);
    }

    for (const [val, count] of map.entries()) {
      items.push({
        value: val,
        label: formatNumberDisplay(val),
        count,
      });
    }
  } else {
    // Grouped into bins (Class intervals)
    const min = Math.min(...validNumbers);
    const max = Math.max(...validNumbers);

    if (min === max) {
      items.push({
        value: min,
        label: formatNumberDisplay(min),
        count: total,
      });
    } else {
      // Auto Sturges' formula or custom binCount
      const numBins = binCount && binCount > 1 ? binCount : Math.min(15, Math.max(4, Math.ceil(1 + 3.322 * Math.log10(total))));
      const binWidth = (max - min) / numBins;

      const bins: { minVal: number; maxVal: number; count: number; label: string; mid: number }[] = [];
      for (let i = 0; i < numBins; i++) {
        const bMin = min + i * binWidth;
        const bMax = i === numBins - 1 ? max : min + (i + 1) * binWidth;
        bins.push({
          minVal: bMin,
          maxVal: bMax,
          count: 0,
          label: `${formatNumberDisplay(bMin)} ⊢ ${formatNumberDisplay(bMax)}`,
          mid: (bMin + bMax) / 2,
        });
      }

      for (const val of validNumbers) {
        for (let i = 0; i < bins.length; i++) {
          const bin = bins[i];
          if (i === bins.length - 1) {
            if (val >= bin.minVal && val <= bin.maxVal) {
              bin.count++;
              break;
            }
          } else {
            if (val >= bin.minVal && val < bin.maxVal) {
              bin.count++;
              break;
            }
          }
        }
      }

      items = bins.map(b => ({
        value: b.mid,
        label: b.label,
        count: b.count,
      }));
    }
  }

  // Sorting
  switch (sortOrder) {
    case 'value_asc':
      items.sort((a, b) => a.value - b.value);
      break;
    case 'value_desc':
      items.sort((a, b) => b.value - a.value);
      break;
    case 'freq_desc':
      items.sort((a, b) => b.count - a.count || a.value - b.value);
      break;
    case 'freq_asc':
      items.sort((a, b) => a.count - b.count || a.value - b.value);
      break;
  }

  // Calculate percentages and cumulative totals
  let runningCumulative = 0;
  return items.map(item => {
    runningCumulative += item.count;
    const percentage = total > 0 ? (item.count / total) * 100 : 0;
    const cumulativePercentage = total > 0 ? (runningCumulative / total) * 100 : 0;

    return {
      value: item.value,
      label: item.label,
      count: item.count,
      percentage: Number(percentage.toFixed(1)),
      cumulativeCount: runningCumulative,
      cumulativePercentage: Number(cumulativePercentage.toFixed(1)),
    };
  });
}

/**
 * Format numbers cleanly for UI display
 */
export function formatNumberDisplay(num: number | null | undefined, decimals = 2): string {
  if (num === null || num === undefined || isNaN(num)) return '-';
  // Check if it's integer
  if (Number.isInteger(num)) {
    return num.toLocaleString('pt-BR');
  }
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Calculates counts and percentages of values greater/equal and less than target value
 */
export function calculateTargetComparison(
  rows: DataRow[],
  targetValue: number | null
): TargetComparisonStats {
  const validNumbers = rows
    .map(r => r.numericValue)
    .filter((n): n is number => n !== null);

  const totalValid = validNumbers.length;

  if (totalValid === 0 || targetValue === null || isNaN(targetValue)) {
    return {
      targetValue,
      countGreaterOrEqual: 0,
      percentageGreaterOrEqual: 0,
      countLess: 0,
      percentageLess: 0,
      countEqual: 0,
      countStrictlyGreater: 0,
      totalValid,
      min: totalValid > 0 ? Math.min(...validNumbers) : null,
      max: totalValid > 0 ? Math.max(...validNumbers) : null,
      modes: [],
    };
  }

  let countGreaterOrEqual = 0;
  let countLess = 0;
  let countEqual = 0;
  let countStrictlyGreater = 0;

  for (const val of validNumbers) {
    if (val >= targetValue) {
      countGreaterOrEqual++;
      if (val === targetValue) {
        countEqual++;
      } else {
        countStrictlyGreater++;
      }
    } else {
      countLess++;
    }
  }

  const percentageGreaterOrEqual = totalValid > 0 ? Number(((countGreaterOrEqual / totalValid) * 100).toFixed(1)) : 0;
  const percentageLess = totalValid > 0 ? Number(((countLess / totalValid) * 100).toFixed(1)) : 0;

  return {
    targetValue,
    countGreaterOrEqual,
    percentageGreaterOrEqual,
    countLess,
    percentageLess,
    countEqual,
    countStrictlyGreater,
    totalValid,
    min: Math.min(...validNumbers),
    max: Math.max(...validNumbers),
    modes: [],
  };
}
