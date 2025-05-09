package com.rich.richInterview.job.cycle;

import cn.hutool.core.collection.CollUtil;
import com.rich.richInterview.mapper.QuestionMapper;
import com.rich.richInterview.mapper.esMapper.QuestionEsMapper;
import com.rich.richInterview.model.dto.question.QuestionEsDTO;
import com.rich.richInterview.model.entity.Question;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.client.RequestOptions;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 增量同步问题数据到 es
 * ConditionalOnProperty 当配置了 ES 地址时才生效
 * @author DuRuiChi
 * @return
 * @create 2025/5/2
 * Component : 取消注释开启任务，打开注解关闭 IncSyncPostToEs
 * CommandLineRunner : 封装 run 方法, 每分钟执行一次
 **/
@ConditionalOnProperty(name = "spring.elasticsearch.uris")
@Component
@Slf4j
public class IncSyncQuestionToEs {

    @Resource
    private QuestionMapper questionMapper;

    @Resource
    private QuestionEsMapper questionEsMapper;

    @Resource
    private ElasticsearchRestTemplate elasticsearchRestTemplate;


    @Scheduled(fixedRate = 60 * 1000)
    public void run() {
        // 进一步预防降级方案导致报错
        try {
            // 新增健康检查
            if (!isEsAvailable()) {
                log.warn("ES服务不可用，跳过增量同步");
                return;
            }

            // 查询最近 5 分钟的变更数据（包含逻辑删除）
            long FIVE_MINUTES = 5 * 60 * 1000L;
            Date fiveMinutesAgoDate = new Date(new Date().getTime() - FIVE_MINUTES);
            List<Question> questionList = questionMapper.listQuestionWithDelete(fiveMinutesAgoDate);

            if (CollUtil.isEmpty(questionList)) {
                log.info("no inc question");
                return;
            }

            // 转换并分页同步
            List<QuestionEsDTO> questionEsDTOList = questionList.stream()
                    .map(QuestionEsDTO::objToDto)
                    .collect(Collectors.toList());
            final int pageSize = 500;
            log.info("Inc sync question data to es is start ; The total : {}", questionEsDTOList.size());
            // 分批同步
            for (int i = 0; i < questionEsDTOList.size(); i += pageSize) {
                int end = Math.min(i + pageSize, questionEsDTOList.size());
                log.info("Full sync from {} to {} in progress ......", i, end);
                // 写入索引
                questionEsMapper.saveAll(questionEsDTOList.subList(i, end));
            }

            log.info("Inc sync question data to es is end .");
        } catch (Exception e) {
            log.error("增量同步异常", e);
        }
    }

    /**
     * 检查 ES 客户端配置是否存在
     *
     * @return boolean
     * @author DuRuiChi
     * @create 2025/5/4
     **/
    private boolean isEsAvailable() {
        try {
            // execute 方法用于执行一个操作，这里是检查 ES 客户端是否可用
            return elasticsearchRestTemplate.execute(client -> {
                try {
                    // 尝试ping ES服务器 ， RequestOptions.DEFAULT 是请求选项的默认值
                    return client.ping(RequestOptions.DEFAULT);
                } catch (IOException e) {
                    return false;
                }
            });
        } catch (Exception e) {
            log.error("ES健康检查异常", e);
            return false;
        }
    }
}
