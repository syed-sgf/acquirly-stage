// Deal scenario analysis utilities
export type Scenario = {
  name: string;
  multiplier: number;
  description: string;
};

export const scenarios: Scenario[] = [
  { name: "Conservative", multiplier: 0.8, description: "Worst case scenario" },
  { name: "Base Case", multiplier: 1.0, description: "Expected scenario" },
  { name: "Optimistic", multiplier: 1.2, description: "Best case scenario" },
];

export function calculateScenarios(baseValue: number): Record<string, number> {
  return scenarios.reduce((acc, scenario) => {
    acc[scenario.name] = baseValue * scenario.multiplier;
    return acc;
  }, {} as Record<string, number>);
}
