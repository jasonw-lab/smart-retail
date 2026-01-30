package com.youlai.boot.modules.retail.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.youlai.boot.common.result.PageResult;
import com.youlai.boot.modules.retail.converter.StoreConverter;
import com.youlai.boot.modules.retail.mapper.StoreMapper;
import com.youlai.boot.modules.retail.model.entity.Store;
import com.youlai.boot.modules.retail.model.form.StoreForm;
import com.youlai.boot.modules.retail.model.query.StorePageQuery;
import com.youlai.boot.modules.retail.model.vo.StorePageVO;
import com.youlai.boot.modules.retail.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 店舗サービス実装クラス
 *
 * @author wangjw
 */
@Service
@RequiredArgsConstructor
public class StoreServiceImpl extends ServiceImpl<StoreMapper, Store> implements StoreService {

    private final StoreConverter storeConverter;

    @Override
    public PageResult<StorePageVO> getStorePage(StorePageQuery queryParams) {
        Page<Store> page = new Page<>(queryParams.getPageNum(), queryParams.getPageSize());

        LambdaQueryWrapper<Store> queryWrapper = new LambdaQueryWrapper<Store>()
                .like(StringUtils.hasText(queryParams.getStoreName()), Store::getStoreName, queryParams.getStoreName())
                .like(StringUtils.hasText(queryParams.getStoreCode()), Store::getStoreCode, queryParams.getStoreCode())
                .eq(StringUtils.hasText(queryParams.getStatus()), Store::getStatus, queryParams.getStatus())
                .orderByDesc(Store::getCreateTime);

        IPage<Store> result = this.page(page, queryWrapper);

        List<StorePageVO> list = result.getRecords().stream()
                .map(storeConverter::entity2Vo)
                .collect(Collectors.toList());

        return PageResult.success(list, result.getTotal());
    }

    @Override
    public List<Store> listStores() {
        LambdaQueryWrapper<Store> queryWrapper = new LambdaQueryWrapper<Store>()
                .orderByDesc(Store::getCreateTime);
        return this.list(queryWrapper);
    }

    @Override
    public Store getStoreById(Long id) {
        return this.getById(id);
    }

    @Override
    public boolean createStore(StoreForm form) {
        LambdaQueryWrapper<Store> queryWrapper = new LambdaQueryWrapper<Store>()
                .eq(Store::getStoreCode, form.getStoreCode());
        Store existingStore = this.getOne(queryWrapper, false);

        if (existingStore != null) {
            Store store = storeConverter.form2Entity(form);
            store.setId(existingStore.getId());
            return this.updateById(store);
        } else {
            Store store = storeConverter.form2Entity(form);
            return this.save(store);
        }
    }

    @Override
    public boolean updateStore(Long id, StoreForm form) {
        Store store = storeConverter.form2Entity(form);
        store.setId(id);
        return this.updateById(store);
    }

    @Override
    public boolean deleteStore(Long id) {
        return this.removeById(id);
    }
}
