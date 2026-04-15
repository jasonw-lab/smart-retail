package com.youlai.boot.modules.retail.controller;

import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.common.result.Result;
import com.youlai.boot.modules.retail.model.entity.Alert;
import com.youlai.boot.modules.retail.model.form.AlertForm;
import com.youlai.boot.modules.retail.model.form.AlertStatusForm;
import com.youlai.boot.modules.retail.model.query.AlertPageQuery;
import com.youlai.boot.modules.retail.model.vo.AlertPageVO;
import com.youlai.boot.modules.retail.model.vo.AlertVO;
import com.youlai.boot.modules.retail.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

/**
 * アラート管理コントローラー
 *
 * @author wangjw
 */
@Tag(name = "アラート管理API")
@RestController
@RequestMapping("/api/v1/retail/alerts")
@RequiredArgsConstructor
public class AlertController {
    private final AlertService alertService;

    @Operation(summary = "アラート一覧（ページング）")
    @GetMapping("/page")
    public PageResult<AlertPageVO> getAlertPage(@Valid AlertPageQuery queryParams) {
        return alertService.getAlertPage(queryParams);
    }

    @Operation(summary = "アラート一覧（全件）")
    @GetMapping
    public Result<List<Alert>> listAlerts() {
        return Result.success(alertService.listAlerts());
    }

    @Operation(summary = "アラート新規作成")
    @PostMapping
    public Result<?> createAlert(@RequestBody @Valid AlertForm form) {
        return Result.judge(alertService.createAlert(form));
    }

    @Operation(summary = "アラート更新")
    @PutMapping("/{id}")
    public Result<?> updateAlert(
            @Parameter(description = "アラートID") @PathVariable Long id,
            @RequestBody @Valid AlertForm form) {
        return Result.judge(alertService.updateAlert(id, form));
    }

    @Operation(summary = "アラート削除")
    @DeleteMapping("/{id}")
    public Result<?> deleteAlert(@Parameter(description = "アラートID") @PathVariable Long id) {
        return Result.judge(alertService.deleteAlert(id));
    }

    @Operation(summary = "アラート詳細取得")
    @GetMapping("/{id}")
    public Result<AlertVO> getAlert(@Parameter(description = "アラートID") @PathVariable Long id) {
        return Result.success(alertService.getAlertById(id));
    }

    @Operation(summary = "アラート状態更新")
    @PutMapping("/{id}/status")
    public Result<?> updateAlertStatus(
            @Parameter(description = "アラートID") @PathVariable Long id,
            @RequestBody @Valid AlertStatusForm form) {
        return Result.judge(alertService.updateAlertStatus(id, form));
    }
}