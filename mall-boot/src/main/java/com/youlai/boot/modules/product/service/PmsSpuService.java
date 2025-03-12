package com.youlai.boot.modules.product.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.youlai.boot.modules.product.model.entity.PmsSpu;
import com.youlai.boot.modules.product.model.form.PmsSpuForm;
import com.youlai.boot.modules.product.model.query.PmsSpuQuery;
import com.youlai.boot.modules.product.model.vo.PmsSpuPageVO;

/**
 * 商品服务类
 *
 * @author youlaitech
 * @since 2025-03-04 22:51
 */
public interface PmsSpuService extends IService<PmsSpu> {

    /**
     *商品分页列表
     *
     * @return
     */
    IPage<PmsSpuPageVO> getPmsSpuPage(PmsSpuQuery queryParams);

    /**
     * 获取商品表单数据
     *
     * @param id 商品ID
     * @return
     */
     PmsSpuForm getPmsSpuFormData(Long id);

    /**
     * 新增商品
     *
     * @param formData 商品表单对象
     * @return
     */
    boolean savePmsSpu(PmsSpuForm formData);

    /**
     * 修改商品
     *
     * @param id   商品ID
     * @param formData 商品表单对象
     * @return
     */
    boolean updatePmsSpu(Long id, PmsSpuForm formData);

    /**
     * 删除商品
     *
     * @param ids 商品ID，多个以英文逗号(,)分割
     * @return
     */
    boolean deletePmsSpus(String ids);

}
