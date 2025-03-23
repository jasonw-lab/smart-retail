package com.youlai.boot.modules.product.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.youlai.boot.modules.product.mapper.PmsBrandMapper;
import com.youlai.boot.modules.product.model.entity.PmsBrand;
import com.youlai.boot.modules.product.service.BrandService;
import org.springframework.stereotype.Service;

@Service
public class BrandServiceImpl extends ServiceImpl<PmsBrandMapper, PmsBrand> implements BrandService {
}
