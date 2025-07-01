# RICH面试刷题平台     
        
![LOGO](https://rich-tams.oss-cn-beijing.aliyuncs.com/LOGO2SM.jpg "LOGO.jpg")        
     
在当前的求职市场中，企业越来越注重通过技术面试来评估应聘者的专业素养和实战能力。为帮助求职者更高效地备战技术面试，一个集智能 AI 解答、面试题目类型齐全、精准检索、学习分析、简洁高效于一体的刷题平台显得尤为重要。       
      
作者在保留传统刷题平台的简洁高效实用的体验的前提下，添加了诸多创新性功能，为求职者准备一款结合了主流 AI 模拟面试官 + 构建学习文档、实时动力热点图、新颖的刷题模式、丰富高效的用户体验、markdown风格展示与实时编辑等等，大幅提高用户粘性和用户刷题效率，以及低用户使用成本，是区别于传统面试刷题平台且独立开发的全新平台。      
        
# 核心优势         
         
• 通过多级缓存架构整合Redis与Caffeine实现热点数据实时响应         
• 基于Elasticsearch 构建智能检索系统提升内容查询效率；         
• 运用Redisson分布式数据结构优化核心接口吞吐性能               
• 服务端渲染实现快速首页加载 和 SEO 友好            
• 建立动态IP黑白名单及流量熔断机制强化系统防护体系           
• 实施多维度用户会话管控与智能反爬策略保障业务安全            
• 采用敏捷部署方案配合容灾设计确保服务持续可用       
        
# 后端       
       
• SpringBoot + MySql + MyBatis - Plus + MyBatis X+ Elasticsearch 搜索引擎         
• Sa-Token 权限控制 +HotKey 热点探测 + Sentinel 流量控制 + Nacos 配置中心 + Druid 并发        
• Redis + Caffeine 缓存 + Redisson 分布式锁      
       
# 前端      
       
• React 18服务端渲染 + Ant Design 组件库 + Ant Design Pro     
• Redux 状态管理        
• TypeScript + ESLint + Prettier 代码规范         
• OpenAPI 风格       
