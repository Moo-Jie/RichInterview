package com.rich.richInterview.model.dto.learnPath;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 创建学习路线关系请求
 *
 */
@Data
public class LearnPathAddRequest implements Serializable {

    /**
     * 标题
     */
    private String title;

    /**
     * 内容
     */
    private String content;

    /**
     * 标签列表
     */

    /**
     * 推荐路线
     */
    private String answer;

    private List<String> tags;

    private static final long serialVersionUID = 1L;
}