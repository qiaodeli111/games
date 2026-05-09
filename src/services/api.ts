import type { GamesData, Game, Category } from '../types';

let cachedData: GamesData | null = null;

export async function fetchGamesData(): Promise<GamesData> {
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch('/data/games.json');
  if (!response.ok) {
    throw new Error('Failed to fetch games data');
  }

  cachedData = await response.json();
  return cachedData!;
}

export async function getAllGames(): Promise<Game[]> {
  const data = await fetchGamesData();
  return data.games;
}

export async function getGamesByCategory(categorySlug: string): Promise<Game[]> {
  const data = await fetchGamesData();
  const category = data.allCategories.find(c => c.slug === categorySlug);
  if (!category) {
    return [];
  }
  return data.games.filter(g => g.category_id === category.id);
}

export async function getGameBySlug(slug: string): Promise<Game | undefined> {
  const data = await fetchGamesData();
  return data.games.find(g => g.slug === slug);
}

export async function getCategoryTree(): Promise<Category[]> {
  const data = await fetchGamesData();
  return data.categories;
}

export async function searchGames(query: string): Promise<Game[]> {
  const data = await fetchGamesData();
  const lowerQuery = query.toLowerCase();
  return data.games.filter(
    g =>
      g.name.toLowerCase().includes(lowerQuery) ||
      g.description?.toLowerCase().includes(lowerQuery) ||
      g.category_name.toLowerCase().includes(lowerQuery)
  );
}