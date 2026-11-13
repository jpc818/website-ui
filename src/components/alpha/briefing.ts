export const briefingRoles = [
  { id: "allocator", label: "Institutional allocator" },
  { id: "family-office", label: "Family office" },
  { id: "quant", label: "Quantitative researcher" },
  { id: "individual", label: "Individual trader" },
] as const;

export type BriefingRole = (typeof briefingRoles)[number]["id"];

export const isBriefingRole = (value: unknown): value is BriefingRole =>
  briefingRoles.some((role) => role.id === value);

export const BRIEFING_NAME_MAX = 120;
export const BRIEFING_FIRM_MAX = 160;
