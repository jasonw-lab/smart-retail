package com.youlai.boot.modules.pms.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.youlai.boot.modules.pms.model.entity.PmsCategory;
import com.youlai.boot.modules.pms.model.vo.CategoryVO;
import com.youlai.boot.common.model.Option;

import java.util.List;


/**
 * 商品分类
 *
 * @author <a href="mailto:xianrui0365@163.com">haoxr</a>
 */
public interface CategoryService extends IService<PmsCategory> {


    /**
     * 分类列表（树形）
     *
     * @param parentId
     * @return
     */
    List<CategoryVO> getCategoryList(Long parentId);

    /**
     * 分类列表（级联）
     * @return
     */
    List<Option> getCategoryOptions();


    /**
     *
     * 保存（新增/修改）分类
     *
     *
     * @param category
     * @return
     */
    Long saveCategory(PmsCategory category);

}
