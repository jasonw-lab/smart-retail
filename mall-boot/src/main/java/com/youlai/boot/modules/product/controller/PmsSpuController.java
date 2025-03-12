package com.youlai.boot.modules.product.controller;

import com.youlai.boot.modules.product.model.form.PmsSpuForm;
import com.youlai.boot.modules.product.model.query.PmsSpuQuery;
import com.youlai.boot.modules.product.model.vo.PmsSpuPageVO;
import com.youlai.boot.modules.product.service.PmsSpuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.common.result.Result;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

/**
 * 商品前端控制层
 *
 * @author youlaitech
 * @since 2025-03-04 22:51
 */
@Tag(name = "商品接口")
@RestController
@RequestMapping("/api/v1/pmsSpus")
@RequiredArgsConstructor
public class PmsSpuController  {

    private final PmsSpuService pmsSpuService;

    @Operation(summary = "商品分页列表")
    @GetMapping("/page")
//    @PreAuthorize("@ss.hasPerm('system:pmsSpu:query')")
    public PageResult<PmsSpuPageVO> getPmsSpuPage(PmsSpuQuery queryParams ) {
        IPage<PmsSpuPageVO> result = pmsSpuService.getPmsSpuPage(queryParams);
        return PageResult.success(result);
    }

    @Operation(summary = "新增商品")
    @PostMapping
//    @PreAuthorize("@ss.hasPerm('system:pmsSpu:add')")
    public Result<Void> savePmsSpu(@RequestBody @Valid PmsSpuForm formData ) {
        boolean result = pmsSpuService.savePmsSpu(formData);
        return Result.judge(result);
    }

    @Operation(summary = "获取商品表单数据")
    @GetMapping("/{id}/form")
//    @PreAuthorize("@ss.hasPerm('system:pmsSpu:edit')")
    public Result<PmsSpuForm> getPmsSpuForm(
        @Parameter(description = "商品ID") @PathVariable Long id
    ) {
        PmsSpuForm formData = pmsSpuService.getPmsSpuFormData(id);
        return Result.success(formData);
    }

    @Operation(summary = "修改商品")
    @PutMapping(value = "/{id}")
//    @PreAuthorize("@ss.hasPerm('system:pmsSpu:edit')")
    public Result<Void> updatePmsSpu(
            @Parameter(description = "商品ID") @PathVariable Long id,
            @RequestBody @Validated PmsSpuForm formData
    ) {
        boolean result = pmsSpuService.updatePmsSpu(id, formData);
        return Result.judge(result);
    }

    @Operation(summary = "删除商品")
    @DeleteMapping("/{ids}")
//    @PreAuthorize("@ss.hasPerm('system:pmsSpu:delete')")
    public Result<Void> deletePmsSpus(
        @Parameter(description = "商品ID，多个以英文逗号(,)分割") @PathVariable String ids
    ) {
        boolean result = pmsSpuService.deletePmsSpus(ids);
        return Result.judge(result);
    }
}
