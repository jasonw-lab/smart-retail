package com.youlai.boot.modules.retail.converter;

import com.youlai.boot.modules.retail.model.entity.Store;
import com.youlai.boot.modules.retail.model.form.StoreForm;
import com.youlai.boot.modules.retail.model.vo.StorePageVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

/**
 * 店舗コンバーター
 *
 * @author jason.w
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface StoreConverter {

    /**
     * StoreForm から Store エンティティへの変換
     *
     * @param form 店舗フォーム
     * @return 店舗エンティティ
     */
    @Mapping(target = "id", ignore = true)
    Store form2Entity(StoreForm form);

    /**
     * Store エンティティから StorePageVO への変換
     *
     * @param entity 店舗エンティティ
     * @return 店舗ページングVO
     */
    StorePageVO entity2Vo(Store entity);
}
