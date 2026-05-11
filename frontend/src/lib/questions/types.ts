export type Domain =
  | 'identity-governance'
  | 'storage'
  | 'compute'
  | 'networking'
  | 'monitoring';

export const DOMAINS: Domain[] = [
  'identity-governance',
  'storage',
  'compute',
  'networking',
  'monitoring',
];

export const DOMAIN_LABELS: Record<Domain, string> = {
  'identity-governance': 'Identity & Governance',
  storage: 'Storage',
  compute: 'Compute',
  networking: 'Networking',
  monitoring: 'Monitoring',
};

export interface FlashcardContent {
  front: string;
  back: string;
}

export interface McqContent {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface ProductIdContent {
  service_name: string;
  category: string;
  description: string;
  icon_url?: string;
  common_confusions?: string[];
}

export interface BaseQuestion {
  id: string;
  type: 'flashcard' | 'mcq' | 'product-id';
  domain: Domain;
  topic: string;
  difficulty: 1 | 2 | 3;
}

export interface FlashcardQuestion extends BaseQuestion {
  type: 'flashcard';
  content: FlashcardContent;
}

export interface McqQuestion extends BaseQuestion {
  type: 'mcq';
  content: McqContent;
}

export interface ProductIdQuestion extends BaseQuestion {
  type: 'product-id';
  content: ProductIdContent;
}

export type Question = FlashcardQuestion | McqQuestion | ProductIdQuestion;
