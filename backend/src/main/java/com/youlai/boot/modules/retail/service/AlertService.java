package com.youlai.boot.modules.retail.service;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.model.entity.Alert;
import com.youlai.boot.modules.retail.model.form.AlertForm;
import com.youlai.boot.modules.retail.model.query.AlertPageQuery;
import com.youlai.boot.modules.retail.model.vo.AlertPageVO;

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
    Alert getAlertById(Long id);

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
     * アラート解決
     *
     * @param id アラートID
     * @return 解決結果
     */
    boolean resolveAlert(Long id);
}