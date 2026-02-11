package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.Device;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * デバイスマッパー
 *
 * @author jason.w
 */
@Mapper
public interface DeviceMapper extends BaseMapper<Device> {

    /**
     * 店舗コードとデバイスタイプでデバイスを検索
     *
     * @param storeId    店舗ID
     * @param deviceType デバイスタイプ
     * @return デバイス
     */
    Device findByStoreIdAndDeviceType(@Param("storeId") Long storeId, @Param("deviceType") String deviceType);

    /**
     * 店舗IDでデバイス一覧を取得
     *
     * @param storeId 店舗ID
     * @return デバイス一覧
     */
    List<Device> findByStoreId(@Param("storeId") Long storeId);
}
