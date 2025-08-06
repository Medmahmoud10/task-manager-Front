// src/app/models/task.model.ts
export interface Task {
  id: number;
  title: string;
  description: string;
  priority: PriorityLevel; // 1=High, 2=Medium, 3=Low
  categorie_id: number;
  newCategorie?: string; // Optional for new categories
  created_at: string;
  updated_at: string;
}

export type PriorityLevel = '1' | '2' | '3';


interface Categorie {
  name: string;
  // Add other required fields here
}