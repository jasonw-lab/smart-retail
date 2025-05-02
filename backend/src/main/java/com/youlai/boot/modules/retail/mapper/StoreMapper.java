package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.Store;
import org.apache.ibatis.annotations.Mapper;

/**
 * 店舗管理マッパー
 *
 * @author wangjw
 */
@Mapper
public interface StoreMapper extends BaseMapper<Store> {
}