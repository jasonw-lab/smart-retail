package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.InventoryIn;
import org.apache.ibatis.annotations.Mapper;

/**
 * 入庫管理マッパー
 *
 * @author wangjw
 */
@Mapper
public interface InventoryInMapper extends BaseMapper<InventoryIn> {
}