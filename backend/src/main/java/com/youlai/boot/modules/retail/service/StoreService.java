package com.youlai.boot.modules.retail.service;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.model.entity.Store;
import com.youlai.boot.modules.retail.model.form.StoreForm;
import com.youlai.boot.modules.retail.model.query.StorePageQuery;
import com.youlai.boot.modules.retail.model.vo.StorePageVO;

import java.util.List;

/**
 * 店舗サービスインターフェース
 *
 * @author wangjw
 */
public interface StoreService {

    /**
     * 店舗一覧（ページング）取得
     *
     * @param queryParams クエリパラメータ
     * @return ページング結果
     */
    PageResult<StorePageVO> getStorePage(StorePageQuery queryParams);

    /**
     * 店舗一覧（全件）取得
     *
     * @return 店舗リスト
     */
    List<Store> listStores();

    /**
     * 店舗詳細取得
     *
     * @param id 店舗ID
     * @return 店舗詳細
     */
    Store getStoreById(Long id);

    /**
     * 店舗新規作成
     *
     * @param form 店舗フォーム
     * @return 作成結果
     */
    boolean createStore(StoreForm form);

    /**
     * 店舗更新
     *
     * @param id   店舗ID
     * @param form 店舗フォーム
     * @return 更新結果
     */
    boolean updateStore(Long id, StoreForm form);

    /**
     * 店舗削除
     *
     * @param id 店舗ID
     * @return 削除結果
     */
    boolean deleteStore(Long id);
}
