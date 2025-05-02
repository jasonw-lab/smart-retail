package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.InventoryHistory;
import org.apache.ibatis.annotations.Mapper;

/**
 * 在庫履歴マッパー
 *
 * @author wangjw
 */
@Mapper
public interface InventoryHistoryMapper extends BaseMapper<InventoryHistory> {
}