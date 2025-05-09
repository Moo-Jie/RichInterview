package com.rich.richInterview.mapper.esMapper;

import com.rich.richInterview.model.dto.question.QuestionEsDTO;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

/**
 * 题目 ES Mapper
 * @ConditionalOnProperty 当配置了 ES 地址时才生效
 * @author DuRuiChi
 * @create 2025/5/2
 */
@ConditionalOnProperty(name = "spring.elasticsearch.uris")
public interface QuestionEsMapper
        // ElasticsearchRepository 是 Spring Data Elasticsearch 提供的一个接口，包含大量操作 Es 索引的方法。
        // 考虑没有复杂的查询需求，直接继承 ElasticsearchRepository ，否则考虑 elasticsearchRestTemplate 自己写查询。
        extends ElasticsearchRepository<QuestionEsDTO, Long> {
    /**
     * 根据用户 id 查询
     * 根据方法名自动映射为查询操作
     * 方法名格式：findBy + 属性名 + 条件
     *
     * @param userId
     * @return
     */
    List<QuestionEsDTO> findByUserId(Long userId);

}
