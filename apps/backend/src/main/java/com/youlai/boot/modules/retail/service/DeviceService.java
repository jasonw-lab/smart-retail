package com.youlai.boot.modules.retail.service;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.model.entity.Device;
import com.youlai.boot.modules.retail.model.form.DeviceForm;
import com.youlai.boot.modules.retail.model.query.DevicePageQuery;
import com.youlai.boot.modules.retail.model.vo.DevicePageVO;

import java.util.List;

/**
 * デバイスサービスインターフェース
 *
 * @author jason.w
 */
public interface DeviceService {

    /**
     * デバイス一覧（ページング）取得
     *
     * @param queryParams クエリパラメータ
     * @return ページング結果
     */
    PageResult<DevicePageVO> getDevicePage(DevicePageQuery queryParams);

    /**
     * デバイス一覧（全件）取得
     *
     * @return デバイスリスト
     */
    List<Device> listDevices();

    /**
     * 店舗別デバイス一覧取得
     *
     * @param storeId 店舗ID
     * @return デバイスリスト
     */
    List<Device> listDevicesByStoreId(Long storeId);

    /**
     * デバイス詳細取得
     *
     * @param id デバイスID
     * @return デバイス詳細
     */
    Device getDeviceById(Long id);

    /**
     * デバイス新規作成
     *
     * @param form デバイスフォーム
     * @return 作成結果
     */
    boolean createDevice(DeviceForm form);

    /**
     * デバイス更新
     *
     * @param id   デバイスID
     * @param form デバイスフォーム
     * @return 更新結果
     */
    boolean updateDevice(Long id, DeviceForm form);

    /**
     * デバイス削除
     *
     * @param id デバイスID
     * @return 削除結果
     */
    boolean deleteDevice(Long id);
}
