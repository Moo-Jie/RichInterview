package com.rich.richInterview.model.dto.questionBankHotspot;

import com.rich.richInterview.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * 查询题库热点请求
 *
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class QuestionBankHotspotQueryRequest extends PageRequest implements Serializable {

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