package com.youlai.boot.modules.retail.service;

import com.youlai.boot.modules.retail.model.form.HeartbeatPayload;

/**
 * Heartbeatサービスインターフェース
 *
 * @author jason.w
 */
public interface HeartbeatService {

    /**
     * Heartbeatを受信・処理する
     *
     * @param payload Heartbeatペイロード
     * @return 処理結果
     */
    boolean receiveHeartbeat(HeartbeatPayload payload);
}
