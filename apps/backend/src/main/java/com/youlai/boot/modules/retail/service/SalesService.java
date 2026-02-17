package com.youlai.boot.modules.retail.service;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.model.query.SalesPageQuery;
import com.youlai.boot.modules.retail.model.vo.SalesDetailVO;
import com.youlai.boot.modules.retail.model.vo.SalesPageVO;
import com.youlai.boot.modules.retail.model.vo.SalesSummaryVO;

/**
 * 決済履歴サービスインターフェース
 *
 * @author jason.w
 */
public interface SalesService {

    /**
     * 決済履歴一覧（ページング）取得
     *
     * @param queryParams クエリパラメータ
     * @return ページング結果
     */
    PageResult<SalesPageVO> getSalesPage(SalesPageQuery queryParams);

    /**
     * 決済詳細取得（明細含む）
     *
     * @param id 売上ID
     * @return 決済詳細
     */
    SalesDetailVO getSalesDetail(Long id);

    /**
     * 決済サマリ取得
     *
     * @param queryParams クエリパラメータ
     * @return 決済サマリ
     */
    SalesSummaryVO getSalesSummary(SalesPageQuery queryParams);
}
