package com.youlai.boot.modules.retail.config;

import com.youlai.boot.modules.retail.converter.StoreConverter;
import com.youlai.boot.modules.retail.model.entity.Store;
import com.youlai.boot.modules.retail.model.form.StoreForm;
import com.youlai.boot.modules.retail.model.vo.StorePageVO;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Converter beans for the retail module.
 *
 * Some IDE run configurations can disable annotation processing, which prevents
 * MapStruct from generating *ConverterImpl classes and leads to missing beans at runtime.
 * This configuration provides a safe fallback for critical converters.
 */
@Configuration
public class RetailConverterConfig {

    @Bean
    @Primary
    public StoreConverter storeConverter() {
        StoreConverter generated = tryCreateGeneratedStoreConverter();
        if (generated != null) {
            return generated;
        }

        return new StoreConverter() {
            @Override
            public Store form2Entity(StoreForm form) {
                if (form == null) {
                    return null;
                }
                Store store = new Store();
                store.setStoreCode(form.getStoreCode());
                store.setStoreName(form.getStoreName());
                store.setAddress(form.getAddress());
                store.setPhone(form.getPhone());
                store.setManager(form.getManager());
                store.setStatus(form.getStatus());
                store.setOpeningHours(form.getOpeningHours());
                return store;
            }

            @Override
            public StorePageVO entity2Vo(Store entity) {
                if (entity == null) {
                    return null;
                }
                StorePageVO vo = new StorePageVO();
                vo.setId(entity.getId());
                vo.setStoreCode(entity.getStoreCode());
                vo.setStoreName(entity.getStoreName());
                vo.setAddress(entity.getAddress());
                vo.setPhone(entity.getPhone());
                vo.setManager(entity.getManager());
                vo.setStatus(entity.getStatus());
                vo.setOpeningHours(entity.getOpeningHours());
                vo.setCreateTime(entity.getCreateTime());
                vo.setUpdateTime(entity.getUpdateTime());
                return vo;
            }
        };
    }

    private StoreConverter tryCreateGeneratedStoreConverter() {
        try {
            Class<?> clazz = Class.forName("com.youlai.boot.modules.retail.converter.StoreConverterImpl");
            return (StoreConverter) clazz.getDeclaredConstructor().newInstance();
        } catch (Throwable ignored) {
            return null;
        }
    }
}

