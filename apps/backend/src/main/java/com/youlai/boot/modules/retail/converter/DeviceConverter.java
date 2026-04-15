package com.youlai.boot.modules.retail.converter;

import com.youlai.boot.modules.retail.model.entity.Device;
import com.youlai.boot.modules.retail.model.form.DeviceForm;
import com.youlai.boot.modules.retail.model.vo.DevicePageVO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

/**
 * デバイスコンバーター
 *
 * @author jason.w
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface DeviceConverter {

    /**
     * DeviceForm から Device エンティティへの変換
     *
     * @param form デバイスフォーム
     * @return デバイスエンティティ
     */
    @Mapping(target = "id", ignore = true)
    Device form2Entity(DeviceForm form);

    /**
     * Device エンティティから DevicePageVO への変換
     *
     * @param entity デバイスエンティティ
     * @return デバイスページングVO
     */
    @Mapping(target = "storeName", ignore = true)
    DevicePageVO entity2Vo(Device entity);
}
