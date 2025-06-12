package com.rich.richInterview.model.dto.questionBankHotspot;

import lombok.Data;

import java.io.Serializable;

/**
 * 更新题库热点请求
 *
 */
@Data
public class QuestionBankHotspotUpdateRequest implements Serializable {

    /**
     * 题库 id
     */
    private Long questionBankId;

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