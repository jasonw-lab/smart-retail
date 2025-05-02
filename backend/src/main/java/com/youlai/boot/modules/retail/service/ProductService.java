package com.youlai.boot.modules.retail.service;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.model.entity.Product;
import com.youlai.boot.modules.retail.model.form.ProductForm;
import com.youlai.boot.modules.retail.model.query.ProductPageQuery;
import com.youlai.boot.modules.retail.model.vo.ProductPageVO;

import java.util.List;

/**
 * 商品サービスインターフェース
 *
 * @author wangjw
 */
public interface ProductService {

    /**
     * 商品一覧（ページング）取得
     *
     * @param queryParams クエリパラメータ
     * @return ページング結果
     */
    PageResult<ProductPageVO> getProductPage(ProductPageQuery queryParams);

    /**
     * 商品一覧（全件）取得
     *
     * @return 商品リスト
     */
    List<Product> listProducts();

    /**
     * 商品詳細取得
     *
     * @param id 商品ID
     * @return 商品詳細
     */
    Product getProductById(Long id);

    /**
     * 商品新規作成
     *
     * @param form 商品フォーム
     * @return 作成結果
     */
    boolean createProduct(ProductForm form);

    /**
     * 商品更新
     *
     * @param id   商品ID
     * @param form 商品フォーム
     * @return 更新結果
     */
    boolean updateProduct(Long id, ProductForm form);

    /**
     * 商品削除
     *
     * @param id 商品ID
     * @return 削除結果
     */
    boolean deleteProduct(Long id);
}