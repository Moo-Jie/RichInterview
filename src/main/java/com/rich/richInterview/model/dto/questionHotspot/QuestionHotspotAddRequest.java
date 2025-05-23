package com.rich.richInterview.model.dto.questionHotspot;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 创建题目热点请求
 *
 */
@Data
public class QuestionHotspotAddRequest implements Serializable {

    /**
     * 题目 id
     */
    private Long questionId;

    /**
     * 浏览量
     */
    private Integer viewNum;

    /**
     * 点赞量
     */
    private Integer starNum;

    /**
     * 转发量
     */
    private Integer forwardNum;

    /**
     * 收藏量
     */
    private Integer collectNum;

    /**
     * 评论量
     */
    private Integer commentNum;

    private static final long serialVersionUID = 1L;
}