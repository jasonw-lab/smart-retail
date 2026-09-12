/**
 * カテゴリエンティティ
 */
export interface Category {
  id: number;
  categoryCode: string;
  categoryName: string;
  description?: string;
  sortOrder?: number;
  status?: number;
  createTime?: string;
  updateTime?: string;
}

/**
 * カテゴリ作成DTO
 */
export interface CreateCategoryDto {
  categoryCode: string;
  categoryName: string;
  description?: string;
  sortOrder?: number;
  status?: number;
}

/**
 * カテゴリ更新DTO
 */
export type UpdateCategoryDto = Partial<CreateCategoryDto>;
