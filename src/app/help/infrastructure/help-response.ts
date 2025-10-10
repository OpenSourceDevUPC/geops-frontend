export interface HelpResponse {
  id: string;
  question: string;
  answer: string; // Puede contener HTML o texto enriquecido
  category?: string;
}
