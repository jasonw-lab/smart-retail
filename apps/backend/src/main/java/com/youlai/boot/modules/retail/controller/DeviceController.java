package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.common.result.Result;
import com.youlai.boot.modules.retail.model.entity.Device;
import com.youlai.boot.modules.retail.model.form.DeviceForm;
import com.youlai.boot.modules.retail.model.query.DevicePageQuery;
import com.youlai.boot.modules.retail.model.vo.DevicePageVO;
import com.youlai.boot.modules.retail.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * デバイス管理API
 *
 * @author jason.w
 */
@Tag(name = "デバイス管理API")
@RestController
@RequestMapping("/api/v1/retail/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @Operation(summary = "デバイス一覧（ページング）")
    @GetMapping("/page")
    public PageResult<DevicePageVO> getDevicePage(@Valid DevicePageQuery queryParams) {
        return deviceService.getDevicePage(queryParams);
    }

    @Operation(summary = "デバイス一覧（全件）")
    @GetMapping
    public Result<List<Device>> listDevices() {
        return Result.success(deviceService.listDevices());
    }

    @Operation(summary = "店舗別デバイス一覧")
    @GetMapping("/store/{storeId}")
    public Result<List<Device>> listDevicesByStoreId(
            @Parameter(description = "店舗ID") @PathVariable Long storeId) {
        return Result.success(deviceService.listDevicesByStoreId(storeId));
    }

    @Operation(summary = "デバイス詳細取得")
    @GetMapping("/{id}")
    public Result<Device> getDevice(@PathVariable Long id) {
        return Result.success(deviceService.getDeviceById(id));
    }

    @Operation(summary = "デバイス新規作成")
    @PostMapping
    public Result<?> createDevice(@RequestBody @Valid DeviceForm form) {
        return Result.judge(deviceService.createDevice(form));
    }

    @Operation(summary = "デバイス更新")
    @PutMapping("/{id}")
    public Result<?> updateDevice(@PathVariable Long id, @RequestBody @Valid DeviceForm form) {
        return Result.judge(deviceService.updateDevice(id, form));
    }

    @Operation(summary = "デバイス削除")
    @DeleteMapping("/{id}")
    public Result<?> deleteDevice(@PathVariable Long id) {
        return Result.judge(deviceService.deleteDevice(id));
    }
}
