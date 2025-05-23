package com.rich.richInterview.model.dto.questionBankHotspot;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 创建题库热点请求
 *
 */
@Data
public class QuestionBankHotspotAddRequest implements Serializable {

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