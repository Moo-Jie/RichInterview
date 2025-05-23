package com.rich.richInterview.mapper.esMapper;

import com.rich.richInterview.model.dto.post.PostEsDTO;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

/**
 * 帖子 ES 操作
 */
@ConditionalOnProperty(name = "spring.elasticsearch.uris")
public interface PostEsMapper extends ElasticsearchRepository<PostEsDTO, Long> {
    List<PostEsDTO> findByUserId(Long userId);
}