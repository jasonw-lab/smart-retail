package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.converter.DeviceConverter;
import com.youlai.boot.modules.retail.mapper.DeviceMapper;
import com.youlai.boot.modules.retail.mapper.StoreMapper;
import com.youlai.boot.modules.retail.model.entity.Device;
import com.youlai.boot.modules.retail.model.entity.Store;
import com.youlai.boot.modules.retail.model.form.DeviceForm;
import com.youlai.boot.modules.retail.model.query.DevicePageQuery;
import com.youlai.boot.modules.retail.model.vo.DevicePageVO;
import com.youlai.boot.modules.retail.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * デバイスサービス実装クラス
 *
 * @author jason.w
 */
@Service
@RequiredArgsConstructor
public class DeviceServiceImpl extends ServiceImpl<DeviceMapper, Device> implements DeviceService {

    private final DeviceConverter deviceConverter;
    private final StoreMapper storeMapper;

    @Override
    public PageResult<DevicePageVO> getDevicePage(DevicePageQuery queryParams) {
        Page<Device> page = new Page<>(queryParams.getPageNum(), queryParams.getPageSize());

        LambdaQueryWrapper<Device> queryWrapper = new LambdaQueryWrapper<Device>()
                .eq(queryParams.getStoreId() != null, Device::getStoreId, queryParams.getStoreId())
                .eq(StringUtils.hasText(queryParams.getDeviceType()), Device::getDeviceType, queryParams.getDeviceType())
                .eq(StringUtils.hasText(queryParams.getStatus()), Device::getStatus, queryParams.getStatus())
                .like(StringUtils.hasText(queryParams.getDeviceName()), Device::getDeviceName, queryParams.getDeviceName())
                .like(StringUtils.hasText(queryParams.getDeviceCode()), Device::getDeviceCode, queryParams.getDeviceCode())
                .orderByAsc(Device::getStoreId)
                .orderByAsc(Device::getDeviceType)
                .orderByDesc(Device::getCreateTime);

        IPage<Device> result = this.page(page, queryWrapper);

        // 店舗名を取得するためのマップを作成
        Set<Long> storeIds = result.getRecords().stream()
                .map(Device::getStoreId)
                .collect(Collectors.toSet());

        Map<Long, String> storeNameMap = Map.of();
        if (!storeIds.isEmpty()) {
            List<Store> stores = storeMapper.selectBatchIds(storeIds);
            storeNameMap = stores.stream()
                    .collect(Collectors.toMap(Store::getId, Store::getStoreName));
        }

        Map<Long, String> finalStoreNameMap = storeNameMap;
        List<DevicePageVO> list = result.getRecords().stream()
                .map(device -> {
                    DevicePageVO vo = deviceConverter.entity2Vo(device);
                    vo.setStoreName(finalStoreNameMap.getOrDefault(device.getStoreId(), ""));
                    return vo;
                })
                .collect(Collectors.toList());

        return PageResult.success(list, result.getTotal());
    }

    @Override
    public List<Device> listDevices() {
        LambdaQueryWrapper<Device> queryWrapper = new LambdaQueryWrapper<Device>()
                .orderByAsc(Device::getStoreId)
                .orderByAsc(Device::getDeviceType)
                .orderByDesc(Device::getCreateTime);
        return this.list(queryWrapper);
    }

    @Override
    public List<Device> listDevicesByStoreId(Long storeId) {
        LambdaQueryWrapper<Device> queryWrapper = new LambdaQueryWrapper<Device>()
                .eq(Device::getStoreId, storeId)
                .orderByAsc(Device::getDeviceType)
                .orderByDesc(Device::getCreateTime);
        return this.list(queryWrapper);
    }

    @Override
    public Device getDeviceById(Long id) {
        return this.getById(id);
    }

    @Override
    public boolean createDevice(DeviceForm form) {
        Device device = deviceConverter.form2Entity(form);

        // デバイスコードが未指定の場合は自動採番
        if (!StringUtils.hasText(device.getDeviceCode())) {
            device.setDeviceCode(generateDeviceCode(form.getStoreId(), form.getDeviceType()));
        }

        // デフォルトステータスを設定
        if (!StringUtils.hasText(device.getStatus())) {
            device.setStatus("OFFLINE");
        }

        // 空文字のmetadataはnullに変換（JSON型カラムのため）
        if (!StringUtils.hasText(device.getMetadata())) {
            device.setMetadata(null);
        }

        return this.save(device);
    }

    @Override
    public boolean updateDevice(Long id, DeviceForm form) {
        Device device = deviceConverter.form2Entity(form);
        device.setId(id);

        // 空文字のmetadataはnullに変換（JSON型カラムのため）
        if (!StringUtils.hasText(device.getMetadata())) {
            device.setMetadata(null);
        }

        return this.updateById(device);
    }

    @Override
    public boolean deleteDevice(Long id) {
        return this.removeById(id);
    }

    /**
     * デバイスコードを自動採番
     * フォーマット: DEV-{店舗ID}-{デバイスタイプ略称}-{連番}
     *
     * @param storeId    店舗ID
     * @param deviceType デバイスタイプ
     * @return デバイスコード
     */
    private String generateDeviceCode(Long storeId, String deviceType) {
        String typeAbbr = getDeviceTypeAbbreviation(deviceType);

        // 同じ店舗・タイプのデバイス数をカウント
        LambdaQueryWrapper<Device> queryWrapper = new LambdaQueryWrapper<Device>()
                .eq(Device::getStoreId, storeId)
                .eq(Device::getDeviceType, deviceType);
        long count = this.count(queryWrapper);

        return String.format("DEV-%d-%s-%02d", storeId, typeAbbr, count + 1);
    }

    /**
     * デバイスタイプの略称を取得
     *
     * @param deviceType デバイスタイプ
     * @return 略称
     */
    private String getDeviceTypeAbbreviation(String deviceType) {
        return switch (deviceType) {
            case "PAYMENT_TERMINAL" -> "POS";
            case "CAMERA" -> "CAM";
            case "GATE" -> "GATE";
            case "REFRIGERATOR_SENSOR" -> "REF";
            case "PRINTER" -> "PRT";
            case "NETWORK_ROUTER" -> "NET";
            default -> "DEV";
        };
    }
}
