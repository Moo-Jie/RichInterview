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
     * 标题
     */
    private String title;

    /**
     * 内容
     */
    private String content;

    /**
     * 创建用户 id
     */
    private Long userId;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 标签列表
     */
    private List<String> tagList;

    /**
     * 创建用户信息
     */
    private UserVO user;

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
        List<String> tagList = questionBankHotspotVO.getTagList();
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
