package com.rich.richInterview.model.dto.questionReview;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 创建题目审批请求
 *
 */
@Data
public class QuestionReviewAddRequest implements Serializable {

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
    private List<String> tags;

    /**
     * 推荐答案
     */
    private String answer;

    private static final long serialVersionUID = 1L;
}