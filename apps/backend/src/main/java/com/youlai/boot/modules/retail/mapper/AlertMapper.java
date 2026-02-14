package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.youlai.boot.modules.retail.model.entity.Alert;
import com.youlai.boot.modules.retail.model.query.AlertPageQuery;
import com.youlai.boot.modules.retail.model.vo.AlertPageVO;
import com.youlai.boot.modules.retail.model.vo.AlertVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * アラートマッパー
 *
 * @author wangjw
 */
@Mapper
public interface AlertMapper extends BaseMapper<Alert> {

    /**
     * カラム存在チェック
     *
     * @param columnName カラム名
     * @return 存在する場合はtrue
     */
    boolean hasColumn(@Param("columnName") String columnName);

    /**
     * status カラムを利用した未対応アラート件数取得
     *
     * @return 未対応アラート件数
     */
    long countPendingAlertsByStatus();

    /**
     * resolved カラムを利用した未対応アラート件数取得
     *
     * @return 未対応アラート件数
     */
    long countPendingAlertsByResolved();

    /**
     * アラートページング取得（店舗名・商品名付き）
     *
     * @param page  ページングオブジェクト
     * @param query クエリパラメータ
     * @return ページング結果
     */
    IPage<AlertPageVO> getAlertPage(Page<AlertPageVO> page, @Param("query") AlertPageQuery query);

    /**
     * アラート詳細取得（店舗名・商品名付き）
     *
     * @param id アラートID
     * @return アラート詳細
     */
    AlertVO getAlertDetail(@Param("id") Long id);

    /**
     * 在庫切れアラート対象取得
     * 店舗×商品の有効在庫合計が発注点以下のデータを取得
     *
     * @return 在庫切れ対象リスト（storeId, productId, totalQuantity, reorderPoint）
     */
    List<Map<String, Object>> findLowStockTargets();

    /**
     * 賞味期限接近アラート対象取得
     * 有効在庫の賞味期限が7日以内のデータを取得
     *
     * @return 賞味期限接近対象リスト（storeId, productId, lotNumber, expiryDate, quantity, daysUntilExpiry）
     */
    List<Map<String, Object>> findExpirySoonTargets();

    /**
     * 在庫過多アラート対象取得
     * 店舗×商品の有効在庫合計が適正在庫上限の1.5倍以上のデータを取得
     *
     * @return 在庫過多対象リスト（storeId, productId, totalQuantity, maxStock）
     */
    List<Map<String, Object>> findHighStockTargets();

    /**
     * 未解決アラートの存在チェック
     *
     * @param storeId   店舗ID
     * @param productId 商品ID
     * @param lotNumber ロット番号（NULL許可）
     * @param alertType アラートタイプ
     * @return 未解決アラートが存在する場合はtrue
     */
    boolean existsUnresolvedAlert(@Param("storeId") Long storeId,
                                   @Param("productId") Long productId,
                                   @Param("lotNumber") String lotNumber,
                                   @Param("alertType") String alertType);
}
