package com.youlai.boot.modules.retail.service.impl;

import com.youlai.boot.modules.retail.mapper.CategoryMapper;
import com.youlai.boot.modules.retail.model.entity.Category;
import com.youlai.boot.modules.retail.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * カテゴリサービス実装クラス
 */
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryMapper categoryMapper;

    @Override
    public List<Category> listCategories() {
        return categoryMapper.selectList(null);
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryMapper.selectById(id);
    }

    @Override
    public boolean createCategory(Category category) {
        return categoryMapper.insert(category) > 0;
    }

    @Override
    public boolean updateCategory(Long id, Category category) {
        category.setId(id);
        return categoryMapper.updateById(category) > 0;
    }

    @Override
    public boolean deleteCategory(Long id) {
        return categoryMapper.deleteById(id) > 0;
    }
}