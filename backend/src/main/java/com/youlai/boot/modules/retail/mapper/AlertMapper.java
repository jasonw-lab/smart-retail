package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.Alert;
import org.apache.ibatis.annotations.Mapper;

/**
 * アラートマッパー
 *
 * @author wangjw
 */
@Mapper
public interface AlertMapper extends BaseMapper<Alert> {
}