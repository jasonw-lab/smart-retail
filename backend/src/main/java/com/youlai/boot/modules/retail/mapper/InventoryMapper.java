package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.Inventory;
import org.apache.ibatis.annotations.Mapper;

/**
 * 在庫管理マッパー
 *
 * @author wangjw
 */
@Mapper
public interface InventoryMapper extends BaseMapper<Inventory> {
}