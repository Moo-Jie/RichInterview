package com.rich.richInterview.model.vo;

import cn.hutool.json.JSONUtil;
import com.rich.richInterview.model.entity.LearnPath;
import lombok.Data;
import org.springframework.beans.BeanUtils;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * 学习路线关系视图
 *
 */
@Data
public class LearnPathVO implements Serializable {

    /**
     * id
     */
    private Long id;

    /**
     * 推荐路线
     */
    private String answer;

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
     * @param learnPathVO
     * @return
     */
    public static LearnPath voToObj(LearnPathVO learnPathVO) {
        if (learnPathVO == null) {
            return null;
        }
        LearnPath learnPath = new LearnPath();
        BeanUtils.copyProperties(learnPathVO, learnPath);
        List<String> tagList = learnPathVO.getTagList();
        learnPath.setTags(JSONUtil.toJsonStr(tagList));
        return learnPath;
    }

    /**
     * 对象转封装类
     *
     * @param learnPath
     * @return
     */
    public static LearnPathVO objToVo(LearnPath learnPath) {
        if (learnPath == null) {
            return null;
        }
        LearnPathVO learnPathVO = new LearnPathVO();
        BeanUtils.copyProperties(learnPath, learnPathVO);
        learnPathVO.setTagList(JSONUtil.toList(learnPath.getTags(), String.class));
        return learnPathVO;
    }
}
