package com.rich.richInterview.model.dto.questionBank;

import com.rich.richInterview.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * 查询题库请求
 *
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class QuestionBankQueryRequest extends PageRequest implements Serializable {

    /**
     * id
     */
    private Long id;

    /**
     * id
     */
    private Long notId;

    /**
     * 搜索词
     */
    private String searchText;

    /**
     * 标题
     */
    private String title;

    /**
     * 内容
     */
    private String content;

    /**
     * 图片
     */
    private String picture;

    /**
     * 创建用户 id
     */
    private Long userId;

    /**
     * 描述
     */
    private String description;


    /**
     * 是否查询关联题目
     */
    private Boolean QueryQuestionsFlag = false;

    /**
     * 关联题目分页——当前页号
     */
    private int QuestionsCurrent = 1;

    /**
     * 关联题目分页——页面大小
     */
    private int QuestionsPageSize = 10000;

    private static final long serialVersionUID = 1L;
}