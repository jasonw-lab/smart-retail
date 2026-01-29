package com.youlai.boot.modules.retail.mapper;

import com.youlai.boot.modules.retail.model.vo.InventoryStatusVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * ダッシュボードマッパー
 *
 * @author wangjw
 * @since 2026-01-29
 */
@Mapper
public interface DashboardMapper {

    /**
     * 在庫状況取得
     *
     * @param limit 取得件数
     * @return 在庫状況リスト
     */
    List<InventoryStatusVO> getInventoryStatus(@Param("limit") Integer limit);
}
