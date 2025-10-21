package com.rich.richInterview.model.vo;

import com.rich.richInterview.model.entity.QuestionHotspot;
import lombok.Data;
import org.springframework.beans.BeanUtils;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * 题目热点视图
 *
 */
@Data
public class QuestionHotspotVO implements Serializable {

    /**
     * id
     */
    private Long id;

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
     * 标签列表
     */
    private List<String> tagList;

    /**
     * 内容
     */
    private String content;


    /**
     * 推荐答案
     */
    private String answer;

    /**
     * 封装类转对象
     *
     * @param questionHotspotVO
     * @return
     */
    public static QuestionHotspot voToObj(QuestionHotspotVO questionHotspotVO) {
        if (questionHotspotVO == null) {
            return null;
        }
        QuestionHotspot questionHotspot = new QuestionHotspot();
        BeanUtils.copyProperties(questionHotspotVO, questionHotspot);
        return questionHotspot;
    }

    /**
     * 对象转封装类
     *
     * @param questionHotspot
     * @return
     */
    public static QuestionHotspotVO objToVo(QuestionHotspot questionHotspot) {
        if (questionHotspot == null) {
            return null;
        }
        QuestionHotspotVO questionHotspotVO = new QuestionHotspotVO();
        BeanUtils.copyProperties(questionHotspot, questionHotspotVO);
        return questionHotspotVO;
    }
}
