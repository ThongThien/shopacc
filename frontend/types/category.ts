export interface Category {
  id: number;

  name: string;

  slug: string;

  description?: string;

  thumbnail?: string;

  isActive: boolean;

  parentId?: number | null;
}

export interface CategorySummary {
  id: number;

  name: string;

  slug: string;

  thumbnail?: string;

  soldCount: number;

  availableCount: number;
}

export interface HomeGameSection {
  gameName: string;

  categories: CategorySummary[];
}
