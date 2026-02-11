package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.SalesDetail;
import org.apache.ibatis.annotations.Mapper;

/**
 * 売上明細マッパー
 *
 * @author jason.w
 */
@Mapper
public interface SalesDetailMapper extends BaseMapper<SalesDetail> {
}
