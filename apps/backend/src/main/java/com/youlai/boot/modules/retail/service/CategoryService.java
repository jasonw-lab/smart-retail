package com.youlai.boot.modules.retail.service;

import com.youlai.boot.modules.retail.model.entity.Category;
import java.util.List;

/**
 * カテゴリサービスインターフェース
 */
public interface CategoryService {
    /**
     * カテゴリ一覧を取得
     * @return カテゴリリスト
     */
    List<Category> listCategories();
    
    /**
     * カテゴリを取得
     * @param id カテゴリID
     * @return カテゴリ
     */
    Category getCategoryById(Long id);
    
    /**
     * カテゴリを作成
     * @param category カテゴリ
     * @return 作成結果
     */
    boolean createCategory(Category category);
    
    /**
     * カテゴリを更新
     * @param id カテゴリID
     * @param category カテゴリ
     * @return 更新結果
     */
    boolean updateCategory(Long id, Category category);
    
    /**
     * カテゴリを削除
     * @param id カテゴリID
     * @return 削除結果
     */
    boolean deleteCategory(Long id);
}