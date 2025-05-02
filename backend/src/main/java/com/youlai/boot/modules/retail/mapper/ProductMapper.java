package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.Product;
import org.apache.ibatis.annotations.Mapper;

/**
 * 商品管理マッパー
 *
 * @author wangjw
 */
@Mapper
public interface ProductMapper extends BaseMapper<Product> {
}