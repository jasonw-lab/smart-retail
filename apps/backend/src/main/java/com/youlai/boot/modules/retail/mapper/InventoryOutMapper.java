package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.InventoryOut;
import org.apache.ibatis.annotations.Mapper;

/**
 * 出庫管理マッパー
 *
 * @author wangjw
 */
@Mapper
public interface InventoryOutMapper extends BaseMapper<InventoryOut> {
}