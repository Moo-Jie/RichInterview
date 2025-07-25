package com.rich.richInterview.model.dto.questionBankHotspot;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 编辑题库热点请求
 *
 */
@Data
public class QuestionBankHotspotEditRequest implements Serializable {

    /**
     * 题库id
     */
    private Long questionBankId;

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

    private static final long serialVersionUID = 1L;
}