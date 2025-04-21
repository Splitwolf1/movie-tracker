import { Movie } from './movie.model';

export interface CustomList {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  items: CustomListItem[];
  coverImage?: string;
  tags?: string[];
}

export interface CustomListItem {
  id: string;
  movieId: number;
  movie?: Movie;
  addedAt: Date;
  notes?: string;
}

export interface CreateCustomListRequest {
  name: string;
  description: string;
  isPublic: boolean;
  coverImage?: string;
  tags?: string[];
}

export interface UpdateCustomListRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverImage?: string;
  tags?: string[];
}

export enum CustomListSortOption {
  RECENT = 'recent',
  NAME = 'name',
  ITEM_COUNT = 'itemCount',
  DATE_CREATED = 'dateCreated',
  DATE_UPDATED = 'dateUpdated'
}

export interface CustomListFilter {
  searchTerm?: string;
  sortBy?: CustomListSortOption;
  isPublic?: boolean;
  tags?: string[];
} 