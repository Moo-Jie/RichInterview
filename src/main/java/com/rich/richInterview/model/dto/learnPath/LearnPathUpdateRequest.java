package com.rich.richInterview.model.dto.learnPath;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 更新学习路线关系请求
 *
 */
@Data
public class LearnPathUpdateRequest implements Serializable {

    /**
     * id
     */
    private Long id;

    /**
     * 标题
     */
    private String title;

    /**
     * 内容
     */
    private String content;

    /**
     * 推荐答案
     */
    private String answer;

    /**
     * 标签列表
     */
    private List<String> tags;

    private static final long serialVersionUID = 1L;
}