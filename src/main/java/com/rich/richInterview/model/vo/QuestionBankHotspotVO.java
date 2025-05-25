package com.rich.richInterview.model.vo;

import com.rich.richInterview.model.entity.QuestionBankHotspot;
import lombok.Data;
import org.springframework.beans.BeanUtils;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * 题库热点视图
 *
 */
@Data
public class QuestionBankHotspotVO implements Serializable {

    /**
     * id
     */
    private Long id;

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

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 标题
     */
    private String title;

    /**
     * 介绍
     */
    private String description;

    /**
     * 封装类转对象
     *
     * @param questionBankHotspotVO
     * @return
     */
    public static QuestionBankHotspot voToObj(QuestionBankHotspotVO questionBankHotspotVO) {
        if (questionBankHotspotVO == null) {
            return null;
        }
        QuestionBankHotspot questionBankHotspot = new QuestionBankHotspot();
        BeanUtils.copyProperties(questionBankHotspotVO, questionBankHotspot);
        return questionBankHotspot;
    }

    /**
     * 对象转封装类
     *
     * @param questionBankHotspot
     * @return
     */
    public static QuestionBankHotspotVO objToVo(QuestionBankHotspot questionBankHotspot) {
        if (questionBankHotspot == null) {
            return null;
        }
        QuestionBankHotspotVO questionBankHotspotVO = new QuestionBankHotspotVO();
        BeanUtils.copyProperties(questionBankHotspot, questionBankHotspotVO);
        return questionBankHotspotVO;
    }
}
