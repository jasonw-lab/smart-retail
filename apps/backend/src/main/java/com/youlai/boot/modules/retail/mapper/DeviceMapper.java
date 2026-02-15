package com.youlai.boot.modules.retail.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlai.boot.modules.retail.model.entity.Device;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
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

    /**
     * Heartbeat未受信デバイスを取得（沈黙監視用）
     * last_heartbeat が threshold より古い、または NULL のデバイスを返す
     *
     * @param threshold 閾値日時（これより古いものを対象）
     * @return Heartbeat未受信デバイス一覧
     */
    List<Device> findStaleDevices(@Param("threshold") LocalDateTime threshold);

    /**
     * ステータスでデバイス一覧を取得
     *
     * @param status デバイスステータス（ONLINE, OFFLINE, ERROR, MAINTENANCE）
     * @return デバイス一覧
     */
    List<Device> findByStatus(@Param("status") String status);

    /**
     * デバイスタイプでデバイス一覧を取得
     *
     * @param deviceType デバイスタイプ（PAYMENT_TERMINAL, CAMERA, GATE, etc.）
     * @return デバイス一覧
     */
    List<Device> findByDeviceType(@Param("deviceType") String deviceType);
}
