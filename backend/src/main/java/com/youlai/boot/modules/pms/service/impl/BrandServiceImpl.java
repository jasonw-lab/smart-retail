package com.youlai.boot.modules.pms.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.youlai.boot.modules.pms.mapper.PmsBrandMapper;
import com.youlai.boot.modules.pms.model.entity.PmsBrand;
import com.youlai.boot.modules.pms.service.BrandService;
import org.springframework.stereotype.Service;

@Service
public class BrandServiceImpl extends ServiceImpl<PmsBrandMapper, PmsBrand> implements BrandService {
}
