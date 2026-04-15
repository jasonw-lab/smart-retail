package com.youlai.boot.modules.retail.converter;

import com.youlai.boot.modules.retail.model.entity.Inventory;
import com.youlai.boot.modules.retail.model.entity.InventoryHistory;
import com.youlai.boot.modules.retail.model.form.InventoryForm;
import com.youlai.boot.modules.retail.model.vo.InventoryHistoryVO;
import com.youlai.boot.modules.retail.model.vo.InventoryPageVO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

/**
 * 在庫コンバーター
 *
 * @author jason.w
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface InventoryConverter {

    /**
     * InventoryForm から Inventory エンティティへの変換
     *
     * @param form 在庫フォーム
     * @return 在庫エンティティ
     */
    Inventory form2Entity(InventoryForm form);

    /**
     * Inventory エンティティから InventoryPageVO への変換
     * 注意: storeName, productName, productCode は別途設定が必要
     *
     * @param entity 在庫エンティティ
     * @return 在庫ページングVO
     */
    InventoryPageVO entity2Vo(Inventory entity);

    /**
     * InventoryHistory エンティティから InventoryHistoryVO への変換
     *
     * @param entity 在庫履歴エンティティ
     * @return 在庫履歴VO
     */
    InventoryHistoryVO historyEntity2Vo(InventoryHistory entity);
}
