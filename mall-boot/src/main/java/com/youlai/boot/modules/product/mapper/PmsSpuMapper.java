package com.youlai.boot.modules.product.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.product.model.entity.PmsSpu;
import com.youlai.boot.modules.product.model.query.PmsSpuQuery;
import com.youlai.boot.modules.product.model.vo.PmsSpuPageVO;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;

/**
 * 商品Mapper接口
 *
 * @author youlaitech
 * @since 2025-03-04 22:51
 */
@Mapper
public interface PmsSpuMapper extends BaseMapper<PmsSpu> {

    /**
     * 获取商品分页数据
     *
     * @param page 分页对象
     * @param queryParams 查询参数
     * @return
     */
    Page<PmsSpuPageVO> getPmsSpuPage(Page<PmsSpuPageVO> page, PmsSpuQuery queryParams);

}
