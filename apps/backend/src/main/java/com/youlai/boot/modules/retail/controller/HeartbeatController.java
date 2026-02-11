package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.common.result.Result;
import com.youlai.boot.modules.retail.model.form.HeartbeatPayload;
import com.youlai.boot.modules.retail.service.HeartbeatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Heartbeat受信API
 *
 * @author jason.w
 */
@Tag(name = "Heartbeat受信API")
@RestController
@RequestMapping("/api/v1/retail/heartbeat")
@RequiredArgsConstructor
public class HeartbeatController {

    private final HeartbeatService heartbeatService;

    @Operation(summary = "Heartbeat受信", description = "外部世界（PowerJobシミュレーター）からのHeartbeatを受信し、デバイス状態を更新する")
    @PostMapping
    public Result<?> receiveHeartbeat(@RequestBody @Valid HeartbeatPayload payload) {
        boolean success = heartbeatService.receiveHeartbeat(payload);
        return success ? Result.success() : Result.failed("Heartbeat処理に失敗しました");
    }
}
