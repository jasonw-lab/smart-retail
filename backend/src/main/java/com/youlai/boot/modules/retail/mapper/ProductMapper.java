package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.Product;
import org.apache.ibatis.annotations.Mapper;
 
@Mapper
public interface ProductMapper extends BaseMapper<Product> {
} 