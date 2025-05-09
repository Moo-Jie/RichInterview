package com.rich.richInterview.job.once;

import cn.hutool.core.collection.CollUtil;
import com.rich.richInterview.mapper.esMapper.QuestionEsMapper;
import com.rich.richInterview.model.dto.question.QuestionEsDTO;
import com.rich.richInterview.model.entity.Question;
import com.rich.richInterview.service.QuestionService;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.client.RequestOptions;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;


/**
 * 全量同步问题数据到 es
 * @ConditionalOnProperty 当配置了 ES 地址时才生效
 * @author DuRuiChi
 * @return
 * @create 2025/5/2
 * Component : 取消注释开启任务，打开注解关闭 IncSyncPostToEs
 * CommandLineRunner : 封装 run 方法, 强制执行一次全量同步
 **/
@ConditionalOnProperty(name = "spring.elasticsearch.uris")
@Component
@Slf4j
public class FullSyncQuestionToEs implements CommandLineRunner {

    @Resource
    private QuestionService questionService;

    @Resource
    private QuestionEsMapper questionEsMapper;

    @Resource
    private ElasticsearchRestTemplate elasticsearchRestTemplate;


    // 分页 500 条进行分批同步
    private static final int PAGE_SIZE = 500;

    @Override
    public void run(String... args) {
        // 进一步预防降级方案导致报错
        try {
            // 新增健康检查
            if (!isEsAvailable()) {
                log.warn("ES服务不可用，跳过全量同步");
                return;
            }

            // TODO 大数据时当进行切片优化,此处获取全部题目
            List<Question> questionList = questionService.list();
            if (CollUtil.isEmpty(questionList)) {
                return;
            }

            // 将 数据库实体 转换为 ES实体
            List<QuestionEsDTO> questionEsDTOList = questionList.stream()
                    .map(QuestionEsDTO::objToDto)
                    .collect(Collectors.toList());

            // 分页同步数据到 ES
            int total = questionEsDTOList.size();

            log.info("Full sync question data to es is start ; The total : {}", total);

            // 分页进行分批次同步，保证稳定同步
            CollUtil.split(questionEsDTOList, PAGE_SIZE).forEach(batch -> {
                int beginIdx = questionEsDTOList.indexOf(batch.get(0));
                int endIdx = Math.min(beginIdx + PAGE_SIZE, questionEsDTOList.size());
                log.info("Full sync from {} to {} in progress ......", beginIdx, endIdx);
                questionEsMapper.saveAll(batch);
            });

            log.info("Full sync question data to es is end ; The total : {}", total);
        } catch (Exception e) {
            log.error("全量同步异常", e);
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
