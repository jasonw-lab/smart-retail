package com.youlai.boot.modules.retail.converter;

import com.youlai.boot.modules.retail.model.entity.Alert;
import com.youlai.boot.modules.retail.model.form.AlertForm;
import com.youlai.boot.modules.retail.model.vo.AlertPageVO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

/**
 * アラートコンバーター
 *
 * @author wangjw
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AlertConverter {

    /**
     * AlertForm から Alert エンティティへの変換
     *
     * @param form アラートフォーム
     * @return アラートエンティティ
     */
    Alert form2Entity(AlertForm form);

    /**
     * Alert エンティティから AlertPageVO への変換
     * 注意: storeName, productName, productCode は別途設定が必要
     *
     * @param entity アラートエンティティ
     * @return アラートページングVO
     */
    AlertPageVO entity2Vo(Alert entity);
}