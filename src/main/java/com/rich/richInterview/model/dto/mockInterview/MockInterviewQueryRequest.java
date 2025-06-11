package com.rich.richInterview.model.dto.mockInterview;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.rich.richInterview.common.PageRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * 查询模拟面试请求
 *
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class MockInterviewQueryRequest extends PageRequest implements Serializable {

    /**
     * id（雪花指定防爬）
     */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 工作年限
     */
    private String workExperience;

    /**
     * 工作岗位
     */
    private String jobPosition;

    /**
     * 面试难度
     */
    private String difficulty;

    /**
     * 创建人（用户 id）
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

    private static final long serialVersionUID = 1L;
}