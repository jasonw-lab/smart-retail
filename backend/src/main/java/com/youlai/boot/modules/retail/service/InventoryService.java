package com.youlai.boot.modules.retail.service;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.model.entity.Inventory;
import com.youlai.boot.modules.retail.model.form.InventoryForm;
import com.youlai.boot.modules.retail.model.form.InventoryReplenishForm;
import com.youlai.boot.modules.retail.model.query.InventoryPageQuery;
import com.youlai.boot.modules.retail.model.vo.InventoryHistoryVO;
import com.youlai.boot.modules.retail.model.vo.InventoryPageVO;

import java.util.List;

/**
 * 在庫サービスインターフェース
 *
 * @author jason.w
 */
public interface InventoryService {

    /**
     * 在庫一覧（ページング）取得
     *
     * @param queryParams クエリパラメータ
     * @return ページング結果
     */
    PageResult<InventoryPageVO> getInventoryPage(InventoryPageQuery queryParams);

    /**
     * 在庫一覧（全件）取得
     *
     * @return 在庫リスト
     */
    List<Inventory> listInventories();

    /**
     * 在庫詳細取得
     *
     * @param id 在庫ID
     * @return 在庫詳細
     */
    Inventory getInventoryById(Long id);

    /**
     * 在庫新規作成
     *
     * @param form 在庫フォーム
     * @return 作成結果
     */
    boolean createInventory(InventoryForm form);

    /**
     * 在庫更新
     *
     * @param id   在庫ID
     * @param form 在庫フォーム
     * @return 更新結果
     */
    boolean updateInventory(Long id, InventoryForm form);

    /**
     * 在庫削除
     *
     * @param id 在庫ID
     * @return 削除結果
     */
    boolean deleteInventory(Long id);

    /**
     * 在庫補充記録
     *
     * @param id   在庫ID
     * @param form 補充フォーム
     * @return 補充結果
     */
    boolean replenishInventory(Long id, InventoryReplenishForm form);

    /**
     * 在庫履歴取得
     *
     * @param id 在庫ID
     * @return 在庫履歴リスト
     */
    List<InventoryHistoryVO> getInventoryHistory(Long id);

    /**
     * 在庫アラート検出
     * 在庫状態を更新し、アラートが必要な在庫を検出する
     */
    void detectInventoryAlerts();
}
