package com.rich.richInterview.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import lombok.Data;

/**
 * 题库热点表
 * @TableName question_bank_hotspot
 */
@TableName(value ="question_bank_hotspot")
@Data
public class QuestionBankHotspot {
    /**
     * id
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 题目 id
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

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
}