package com.youlai.boot.modules.product.model.form;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PmsSpuAttributeForm {

    private String id;

    private Long  attributeId;

    private String name;

    private String value;

    private String picUrl;

}
