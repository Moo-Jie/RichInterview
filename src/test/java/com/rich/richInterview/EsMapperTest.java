package com.rich.richInterview;

import com.rich.richInterview.mapper.esMapper.QuestionEsMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;

/**
 * ES Mapper 测试类
 *
 * @author DuRuiChi
 * @return
 * @create 2025/5/2
 **/
@SpringBootTest
public class EsMapperTest {

    @Resource
    private QuestionEsMapper questionEsMapper;

    @Test
    void findByUserId() {
        System.out.println(questionEsMapper.findByUserId(2L));
    }
}
