package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.InventoryTransaction;
import org.apache.ibatis.annotations.Mapper;

/**
 * 入出庫履歴マッパー
 *
 * @author wangjw
 */
@Mapper
public interface InventoryTransactionMapper extends BaseMapper<InventoryTransaction> {
}