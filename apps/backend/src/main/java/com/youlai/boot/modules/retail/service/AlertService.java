package com.youlai.boot.modules.retail.service;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.model.entity.Alert;
import com.youlai.boot.modules.retail.model.form.AlertForm;
import com.youlai.boot.modules.retail.model.form.AlertStatusForm;
import com.youlai.boot.modules.retail.model.query.AlertPageQuery;
import com.youlai.boot.modules.retail.model.vo.AlertPageVO;
import com.youlai.boot.modules.retail.model.vo.AlertVO;

import java.util.List;

/**
 * アラートサービスインターフェース
 *
 * @author wangjw
 */
public interface AlertService {

    /**
     * アラート一覧（ページング）取得
     *
     * @param queryParams クエリパラメータ
     * @return ページング結果
     */
    PageResult<AlertPageVO> getAlertPage(AlertPageQuery queryParams);

    /**
     * アラート一覧（全件）取得
     *
     * @return アラートリスト
     */
    List<Alert> listAlerts();

    /**
     * アラート詳細取得
     *
     * @param id アラートID
     * @return アラート詳細
     */
    AlertVO getAlertById(Long id);

    /**
     * アラート新規作成
     *
     * @param form アラートフォーム
     * @return 作成結果
     */
    boolean createAlert(AlertForm form);

    /**
     * アラート更新
     *
     * @param id   アラートID
     * @param form アラートフォーム
     * @return 更新結果
     */
    boolean updateAlert(Long id, AlertForm form);

    /**
     * アラート削除
     *
     * @param id アラートID
     * @return 削除結果
     */
    boolean deleteAlert(Long id);

    /**
     * アラート状態更新
     *
     * @param id   アラートID
     * @param form 状態更新フォーム
     * @return 更新結果
     */
    boolean updateAlertStatus(Long id, AlertStatusForm form);

    /**
     * 最近のアラート取得
     *
     * @param limit 取得件数
     * @return アラートリスト
     */
    List<Alert> getRecentAlerts(Integer limit);

    /**
     * 在庫切れアラート検出
     * 店舗×商品の有効在庫合計が発注点以下の場合にアラートを生成
     *
     * @return 生成されたアラート数
     */
    int detectLowStockAlerts();

    /**
     * 賞味期限接近アラート検出
     * 有効在庫の賞味期限が7日以内の場合にアラートを生成
     *
     * @return 生成されたアラート数
     */
    int detectExpirySoonAlerts();

    /**
     * 在庫過多アラート検出
     * 店舗×商品の有効在庫合計が適正在庫上限の1.5倍以上の場合にアラートを生成
     *
     * @return 生成されたアラート数
     */
    int detectHighStockAlerts();
}