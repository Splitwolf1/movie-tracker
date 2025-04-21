export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for?: {
    id: number;
    title: string;
    poster_path: string | null;
  }[];
} 