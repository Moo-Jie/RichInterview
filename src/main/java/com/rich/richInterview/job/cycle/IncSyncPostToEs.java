package com.rich.richInterview.job.cycle;

import cn.hutool.core.collection.CollUtil;
import com.rich.richInterview.mapper.esMapper.PostEsMapper;
import com.rich.richInterview.mapper.PostMapper;
import com.rich.richInterview.model.dto.post.PostEsDTO;
import com.rich.richInterview.model.entity.Post;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;

import javax.annotation.Resource;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 增量同步帖子数据到 es
 *
 * @author DuRuiChi
 * @return
 * @create 2025/5/2
 * Component : 取消注释开启任务，打开注解关闭 IncSyncPostToEs
 * CommandLineRunner : 封装 run 方法, 每分钟执行一次
 **/
//@Component
@Slf4j
public class IncSyncPostToEs {

    @Resource
    private PostMapper postMapper;

    @Resource
    private PostEsMapper postEsDao;

    /**
     * 每分钟执行一次
     */
    @Scheduled(fixedRate = 60 * 1000)
    public void run() {
        // 查询最近 5 分钟的变更数据（包含逻辑删除）
        Date fiveMinutesAgoDate = new Date(new Date().getTime() - 5 * 60 * 1000L);
        List<Post> postList = postMapper.listPostWithDelete(fiveMinutesAgoDate);
        if (CollUtil.isEmpty(postList)) {
            log.info("no inc post");
            return;
        }

        // 转换并分页同步
        List<PostEsDTO> postEsDTOList = postList.stream()
                .map(PostEsDTO::objToDto)
                .collect(Collectors.toList());

        final int pageSize = 500;
        int total = postEsDTOList.size();
        log.info("IncSyncPostToEs start, total {}", total);
        for (int i = 0; i < total; i += pageSize) {
            int end = Math.min(i + pageSize, total);
            log.info("Full sync from {} to {} in progress ......", i, end);
            postEsDao.saveAll(postEsDTOList.subList(i, end));
        }
        log.info("IncSyncPostToEs end, total {}", total);
    }
}
