// SBA and acquisition checklists
export type ChecklistItem = {
  id: string;
  text: string;
  category: string;
  required: boolean;
};

export const sbaChecklist: ChecklistItem[] = [
  { id: "1", text: "Business plan prepared", category: "Documentation", required: true },
  { id: "2", text: "3 years of tax returns", category: "Financial", required: true },
  { id: "3", text: "Personal financial statement", category: "Financial", required: true },
  { id: "4", text: "Business valuation completed", category: "Due Diligence", required: true },
  { id: "5", text: "Environmental assessment", category: "Due Diligence", required: false },
];

export const dueDiligenceChecklist: ChecklistItem[] = [
  { id: "1", text: "Financial statements reviewed", category: "Financial", required: true },
  { id: "2", text: "Customer concentration analyzed", category: "Operations", required: true },
  { id: "3", text: "Lease agreements reviewed", category: "Legal", required: true },
  { id: "4", text: "Employee contracts reviewed", category: "HR", required: true },
];
