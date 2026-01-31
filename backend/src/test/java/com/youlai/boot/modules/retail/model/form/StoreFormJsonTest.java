package com.youlai.boot.modules.retail.model.form;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class StoreFormJsonTest {

    @Test
    void shouldDeserializeWithIdField() throws Exception {
        String json = """
                {
                  "id": 24,
                  "storeCode": "S-001",
                  "storeName": "Test Store",
                  "address": "Somewhere",
                  "phone": "000-0000",
                  "manager": "Alice",
                  "status": "active",
                  "openingHours": "9:00-18:00"
                }
                """;

        ObjectMapper objectMapper = new ObjectMapper();
        StoreForm form = objectMapper.readValue(json, StoreForm.class);

        assertEquals(24L, form.getId());
        assertEquals("S-001", form.getStoreCode());
    }
}

