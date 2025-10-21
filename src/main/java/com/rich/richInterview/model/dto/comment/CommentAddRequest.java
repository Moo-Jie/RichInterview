package com.rich.richInterview.model.dto.comment;

import lombok.Data;

import java.io.Serializable;

/**
 * 创建回答请求
 *
 */
@Data
public class CommentAddRequest implements Serializable {

    /**
     * 回答内容
     */
    private String content;

    /**
     * 题目ID
     */
    private Long questionId;

    private static final long serialVersionUID = 1L;
}