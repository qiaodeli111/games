export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children?: Category[];
}

export interface Game {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category_id: number;
  category_name: string;
  category_slug: string;
  author: string | null;
  controls_keyboard: string | null;
  controls_touch: string | null;
  created_at: string;
  thumbnail: string | null;
  screenshots: string[];
}

export interface GamesData {
  categories: Category[];
  games: Game[];
  allCategories: Category[];
}