package com.youlai.boot.modules.product.service.impl;

import com.youlai.boot.modules.product.converter.PmsSpuConverter;
import com.youlai.boot.modules.product.mapper.PmsSpuMapper;
import com.youlai.boot.modules.product.model.entity.PmsSpu;
import com.youlai.boot.modules.product.model.form.PmsSpuForm;
import com.youlai.boot.modules.product.model.query.PmsSpuQuery;
import com.youlai.boot.modules.product.model.vo.PmsSpuPageVO;
import com.youlai.boot.modules.product.service.PmsSpuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;

import java.util.Arrays;
import java.util.List;

import cn.hutool.core.lang.Assert;
import cn.hutool.core.util.StrUtil;

/**
 * 商品服务实现类
 *
 * @author youlaitech
 * @since 2025-03-04 22:51
 */
@Service
@RequiredArgsConstructor
public class PmsSpuServiceImpl extends ServiceImpl<PmsSpuMapper, PmsSpu> implements PmsSpuService {

    private final PmsSpuConverter pmsSpuConverter;

    /**
    * 获取商品分页列表
    *
    * @param queryParams 查询参数
    * @return {@link IPage< PmsSpuPageVO >} 商品分页列表
    */
    @Override
    public IPage<PmsSpuPageVO> getPmsSpuPage(PmsSpuQuery queryParams) {
        Page<PmsSpuPageVO> pageVO = this.baseMapper.getPmsSpuPage(
                new Page<>(queryParams.getPageNum(), queryParams.getPageSize()),
                queryParams
        );
        return pageVO;
    }
    
    /**
     * 获取商品表单数据
     *
     * @param id 商品ID
     * @return
     */
    @Override
    public PmsSpuForm getPmsSpuFormData(Long id) {
        PmsSpu entity = this.getById(id);
        return pmsSpuConverter.toForm(entity);
    }
    
    /**
     * 新增商品
     *
     * @param formData 商品表单对象
     * @return
     */
    @Override
    public boolean savePmsSpu(PmsSpuForm formData) {
        PmsSpu entity = pmsSpuConverter.toEntity(formData);
        return this.save(entity);
    }
    
    /**
     * 更新商品
     *
     * @param id   商品ID
     * @param formData 商品表单对象
     * @return
     */
    @Override
    public boolean updatePmsSpu(Long id,PmsSpuForm formData) {
        PmsSpu entity = pmsSpuConverter.toEntity(formData);
        return this.updateById(entity);
    }
    
    /**
     * 删除商品
     *
     * @param ids 商品ID，多个以英文逗号(,)分割
     * @return
     */
    @Override
    public boolean deletePmsSpus(String ids) {
        Assert.isTrue(StrUtil.isNotBlank(ids), "删除的商品数据为空");
        // 逻辑删除
        List<Long> idList = Arrays.stream(ids.split(","))
                .map(Long::parseLong)
                .toList();
        return this.removeByIds(idList);
    }

}
