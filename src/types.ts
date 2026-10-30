export interface DataRow {
  id: string;
  rawValue: string;
  numericValue: number | null;
  isValid: boolean;
}

export interface FrequencyItem {
  value: number;
  label: string;
  count: number;
  percentage: number;
  cumulativeCount: number;
  cumulativePercentage: number;
}

export interface SummaryStats {
  mean: number | null;
  median: number | null;
  modes: number[];
  count: number;
  totalRows: number;
  invalidCount: number;
  sum: number | null;
  min: number | null;
  max: number | null;
  range: number | null;
  variance: number | null;
  stdDev: number | null;
  q1: number | null;
  q3: number | null;
  iqr: number | null;
}

export interface TargetComparisonStats {
  targetValue: number | null;
  countGreaterOrEqual: number;
  percentageGreaterOrEqual: number;
  countLess: number;
  percentageLess: number;
  countEqual: number;
  countStrictlyGreater: number;
  totalValid: number;
  min: number | null;
  max: number | null;
  modes: number[];
}

export type ChartType = 'bar' | 'line' | 'area' | 'pareto';
export type SortOrder = 'value_asc' | 'value_desc' | 'freq_desc' | 'freq_asc';
export type GroupingMode = 'exact' | 'bins';

export interface PresetDataset {
  name: string;
  columnName: string;
  description: string;
  values: (number | string)[];
}
