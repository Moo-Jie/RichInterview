package com.rich.richInterview.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.rich.richInterview.model.entity.Question;
import org.apache.ibatis.annotations.Select;

import java.util.Date;
import java.util.List;

/**
* @author duruichi
* @description 针对表【question(题目)】的数据库操作Mapper
* @createDate 2025-03-20 17:31:32
* @Entity com.rich.richInterview.model.entity.Question
*/
public interface QuestionMapper extends BaseMapper<Question> {

    /**
     *
     * 查询最近 fiveMinutesAgo 内更新的题目，包括已被删除的
     * @param fiveMinutesAgo
     * @return java.util.List<com.rich.richInterview.model.entity.Question>
     * @author DuRuiChi
     * @create 2025/5/2
     **/
    @Select("select * from question where updateTime >= #{fiveMinutesAgo}")
    List<Question> listQuestionWithDelete(Date fiveMinutesAgo);
}




