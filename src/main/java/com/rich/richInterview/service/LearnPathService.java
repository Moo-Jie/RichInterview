package com.rich.richInterview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.rich.richInterview.model.dto.learnPath.LearnPathQueryRequest;
import com.rich.richInterview.model.entity.LearnPath;
import com.rich.richInterview.model.vo.LearnPathVO;

import javax.servlet.http.HttpServletRequest;

/**
 * 学习路线关系服务
 *
 */
public interface LearnPathService extends IService<LearnPath> {

    /**
     * 校验数据
     *
     * @param learnPath
     * @param add 对创建的数据进行校验
     */
    void validLearnPath(LearnPath learnPath, boolean add);

    /**
     * 获取查询条件
     *
     * @param learnPathQueryRequest
     * @return
     */
    QueryWrapper<LearnPath> getQueryWrapper(LearnPathQueryRequest learnPathQueryRequest);
    
    /**
     * 获取学习路线关系封装
     *
     * @param learnPath
     * @param request
     * @return
     */
    LearnPathVO getLearnPathVO(LearnPath learnPath, HttpServletRequest request);

    /**
     * 分页获取学习路线关系封装
     *
     * @param learnPathPage
     * @param request
     * @return
     */
    Page<LearnPathVO> getLearnPathVOPage(Page<LearnPath> learnPathPage, HttpServletRequest request);
}
