package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.youlai.boot.modules.retail.model.entity.InventoryInOut;
import com.youlai.boot.modules.retail.model.query.InventoryInOutPageQuery;
import com.youlai.boot.modules.retail.model.vo.InventoryInOutVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 入出庫管理マッパー
 *
 * @author wangjw
 */
@Mapper
public interface InventoryInOutMapper extends BaseMapper<InventoryInOut> {
    
    /**
     * 入出庫情報のページング検索
     *
     * @param page ページングパラメータ
     * @param query 検索条件
     * @return 入出庫情報のページング結果
     */
    Page<InventoryInOutVO> getInventoryInOutPage(Page<InventoryInOutVO> page, @Param("query") InventoryInOutPageQuery query);
}