package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.Sales;
import org.apache.ibatis.annotations.Mapper;

/**
 * 売上マッパー
 *
 * @author jason.w
 */
@Mapper
public interface SalesMapper extends BaseMapper<Sales> {
}
