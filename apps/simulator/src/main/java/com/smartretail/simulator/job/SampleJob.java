package com.smartretail.simulator.job;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tech.powerjob.worker.core.processor.ProcessResult;
import tech.powerjob.worker.core.processor.TaskContext;
import tech.powerjob.worker.core.processor.sdk.BasicProcessor;

/**
 * サンプルジョブ（動作確認用）
 *
 * PowerJob管理UIから登録して動作確認する
 * ジョブ名: com.smartretail.simulator.job.SampleJob
 */
@Slf4j
@Component
public class SampleJob implements BasicProcessor {

    @Override
    public ProcessResult process(TaskContext context) throws Exception {
        String jobParams = context.getJobParams();
        log.info("SampleJob executed. instanceId={}, jobParams={}", context.getInstanceId(), jobParams);

        // ジョブパラメータをログ出力
        if (jobParams != null && !jobParams.isEmpty()) {
            log.info("Job parameters: {}", jobParams);
        }

        return new ProcessResult(true, "SampleJob completed successfully at " + java.time.LocalDateTime.now());
    }
}
