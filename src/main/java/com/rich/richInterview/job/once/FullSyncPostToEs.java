package com.rich.richInterview.job.once;

import cn.hutool.core.collection.CollUtil;
import com.rich.richInterview.mapper.esMapper.PostEsMapper;
import com.rich.richInterview.model.dto.post.PostEsDTO;
import com.rich.richInterview.model.entity.Post;
import com.rich.richInterview.service.PostService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;

import javax.annotation.Resource;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 全量同步帖子数据到 es
 * @author DuRuiChi
 * @return
 * @create 2025/5/2
 * Component : 取消注释开启任务，打开注解关闭 IncSyncPostToEs
 * CommandLineRunner : 封装 run 方法, 强制执行一次全量同步
 **/
//@Component
@Slf4j
public class FullSyncPostToEs implements CommandLineRunner {

    @Resource
    private PostService postService;

    @Resource
    private PostEsMapper postEsDao;

    // 分页 500 条进行分批同步
    private static final int PAGE_SIZE = 500;

    @Override
    public void run(String... args) {
        // 获取所有帖子
        List<Post> postList = postService.list();
        if (CollUtil.isEmpty(postList)) {
            return;
        }

        // 将 数据库实体 转换为 ES实体
        List<PostEsDTO> postEsDTOList = postList.stream().map(PostEsDTO::objToDto).collect(Collectors.toList());

        // 分页同步数据到 ES
        int total = postEsDTOList.size();
        log.info("Full sync post data to es is start ; The total : {}", total);

        // 分页进行分批次同步，保证稳定同步
        for (int i = 0; i < total; i += PAGE_SIZE) {
            int end = Math.min(i + PAGE_SIZE, total);
            log.info("Full sync from {} to {} in progress ......", i, end);
            postEsDao.saveAll(postEsDTOList.subList(i, end));
        }

        log.info("Full sync post data to es is end ; The total : {}", total);
    }
}
