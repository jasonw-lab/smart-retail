package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.Category;
import org.apache.ibatis.annotations.Mapper;

/**
 * カテゴリマッパー
 */
@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
}