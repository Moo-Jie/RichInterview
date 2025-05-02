package com.rich.richInterview.job.cycle;

import cn.hutool.core.collection.CollUtil;
import com.rich.richInterview.mapper.QuestionMapper;
import com.rich.richInterview.mapper.esMapper.QuestionEsMapper;
import com.rich.richInterview.model.dto.question.QuestionEsDTO;
import com.rich.richInterview.model.entity.Question;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 增量同步问题数据到 es
 *
 * @author DuRuiChi
 * @return
 * @create 2025/5/2
 * Component : 取消注释开启任务，打开注解关闭 IncSyncPostToEs
 * CommandLineRunner : 封装 run 方法, 每分钟执行一次
 **/
@Component
@Slf4j
public class IncSyncQuestionToEs {

    @Resource
    private QuestionMapper questionMapper;

    @Resource
    private QuestionEsMapper questionEsMapper;

    @Scheduled(fixedRate = 60 * 1000)
    public void run() {
        // 查询最近 5 分钟的变更数据（包含逻辑删除）
        long FIVE_MINUTES = 5 * 60 * 1000L;
        Date fiveMinutesAgoDate = new Date(new Date().getTime() - FIVE_MINUTES);
        List<Question> questionList = questionMapper.listQuestionWithDelete(fiveMinutesAgoDate);

        if (CollUtil.isEmpty(questionList)) {
            log.info("no inc question");
            return;
        }

        // 转换并分页同步
        List<QuestionEsDTO> questionEsDTOList  = questionList.stream()
                .map(QuestionEsDTO::objToDto)
                .collect(Collectors.toList());
        final int pageSize = 500;
        log.info("Inc sync question data to es is start ; The total : {}",  questionEsDTOList .size());
        // 分批同步
        for (int i = 0; i < questionEsDTOList .size(); i += pageSize) {
            int end = Math.min(i + pageSize, questionEsDTOList .size());
            log.info("Full sync from {} to {} in progress ......", i, end);
            // 写入索引
            questionEsMapper.saveAll(questionEsDTOList .subList(i, end));
        }

        log.info("Inc sync question data to es is end .");
    }
}
