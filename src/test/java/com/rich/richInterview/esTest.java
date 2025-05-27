package com.rich.richInterview;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.IndexOperations;
import org.springframework.data.elasticsearch.core.document.Document;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.IndexQuery;
import org.springframework.data.elasticsearch.core.query.IndexQueryBuilder;
import org.springframework.data.elasticsearch.core.query.UpdateQuery;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ES 索引测试类
 *
 * @author DuRuiChi
 * @return null
 * @create 2025/5/2
 **/
@SpringBootTest
public class esTest {

    @Autowired
    // ElasticsearchRestTemplate 是 Spring Data Elasticsearch 提供的一个模板类，用于简化与 Elasticsearch 的交互。
    // 它提供了一系列方法，用于执行各种操作，如创建索引、查询索引、更新索引等。
    // 这些方法封装了底层的 Elasticsearch 客户端 API，使开发者能够更方便地与 Elasticsearch 进行交互。
    private ElasticsearchRestTemplate elasticsearchRestTemplate;

    private final String INDEX_NAME = "es_index_question_version1";

    // 创建索引
    @Test
    public void indexDocument() {
        Map<String, Object> doc = new HashMap<>();
        doc.put("title", "Elasticsearch 如何引入中文分词？");
        doc.put("content", "家人们，在 Elasticsearch 如何引入中文分词呢？你们使用的是什么插件呢？");
        doc.put("tags", "elasticsearch,search");
        doc.put("answer", "使用 IK 中文分词器是个不错的选择！\n" +
                "\n" +
                "GITHUB源：https://github.com/medcl/elasticsearch-analysis-ik\n" +
                "\n" +
                "一定要注意和你的 Elasticsearch 的版本一致呦！");
        doc.put("userId", 2L);
        doc.put("editTime", "2025-06-01 10:06:06");
        doc.put("createTime", "2025-06-06 06:06:06");
        doc.put("updateTime", "2025-06-16 16:06:06");
        doc.put("isDelete", 0);

        IndexQuery indexQuery = new IndexQueryBuilder().withId("1").withObject(doc).build();
        String documentId = elasticsearchRestTemplate.index(indexQuery, IndexCoordinates.of(INDEX_NAME));

        assertThat(documentId).isNotNull();
    }

    // 获取索引内容并打印
    @Test
    public void getDocument() {
        String documentId = "1";

        Map<String, Object> document = elasticsearchRestTemplate.get(documentId, Map.class, IndexCoordinates.of(INDEX_NAME));

        assertThat(document).isNotNull();
        System.out.println(document.values());
    }

    // 更新索引内容并打印
    @Test
    public void updateDocument() {
        String documentId = "1";

        Map<String, Object> updates = new HashMap<>();
        updates.put("updateTime", "2099-01-01 06:06:06");

        UpdateQuery updateQuery = UpdateQuery.builder(documentId)
                .withDocument(Document.from(updates))
                .build();

        elasticsearchRestTemplate.update(updateQuery, IndexCoordinates.of(INDEX_NAME));

        Map<String, Object> updatedDocument = elasticsearchRestTemplate.get(documentId, Map.class, IndexCoordinates.of(INDEX_NAME));
        if (updatedDocument != null) {
            System.out.println(updatedDocument.values());
        }
    }

    // 删除索引内容
    @Test
    public void deleteDocument() {
        String documentId = "1";

        String result = elasticsearchRestTemplate.delete(documentId, IndexCoordinates.of(INDEX_NAME));
        assertThat(result).isNotNull();
    }

    // 删除整个索引
    @Test
    public void deleteIndex() {
        IndexOperations indexOps = elasticsearchRestTemplate.indexOps(IndexCoordinates.of(INDEX_NAME));
        boolean deleted = indexOps.delete();
        assertThat(deleted).isTrue();
    }
}