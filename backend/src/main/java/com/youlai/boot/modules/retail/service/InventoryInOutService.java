package com.youlai.boot.modules.retail.service;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.model.form.InventoryInForm;
import com.youlai.boot.modules.retail.model.form.InventoryOutForm;
import com.youlai.boot.modules.retail.model.query.InventoryInOutPageQuery;
import com.youlai.boot.modules.retail.model.vo.InventoryInOutVO;

/**
 * 入出庫管理サービス
 *
 * @author wangjw
 */
public interface InventoryInOutService {

    /**
     * 入出庫情報のページング検索
     *
     * @param query 検索条件
     * @return 入出庫情報のページング結果
     */
    PageResult<InventoryInOutVO> getInventoryInOutPage(InventoryInOutPageQuery query);

    /**
     * 入庫処理
     *
     * @param form 入庫情報
     * @return 処理結果
     */
    boolean inventoryIn(InventoryInForm form);

    /**
     * 出庫処理
     *
     * @param form 出庫情報
     * @return 処理結果
     */
    boolean inventoryOut(InventoryOutForm form);

    /**
     * 入庫完了処理
     *
     * @param id 入出庫ID
     * @return 処理結果
     */
    boolean completeInventoryIn(Long id);

    /**
     * 出庫完了処理
     *
     * @param id 入出庫ID
     * @return 処理結果
     */
    boolean completeInventoryOut(Long id);

    /**
     * 入出庫情報の詳細取得
     *
     * @param id 入出庫ID
     * @return 入出庫情報
     */
    InventoryInOutVO getInventoryInOutDetail(Long id);
}