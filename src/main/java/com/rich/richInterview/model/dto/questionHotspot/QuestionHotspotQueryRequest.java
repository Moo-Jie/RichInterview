package com.rich.richInterview.model.dto.questionHotspot;

import com.rich.richInterview.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * 查询题目热点请求
 *
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class QuestionHotspotQueryRequest extends PageRequest implements Serializable {

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
     * 回答量
     */
    private Integer commentNum;

    private static final long serialVersionUID = 1L;
}