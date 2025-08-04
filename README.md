# RICH面试刷题平台     
        
![LOGO](https://rich-tams.oss-cn-beijing.aliyuncs.com/LOGO2SM.jpg "LOGO.jpg")        
     
在当前的求职市场中，企业越来越注重通过技术面试来评估应聘者的专业素养和实战能力。为帮助求职者更高效地备战技术面试，一个集智能 AI 解答、面试题目类型齐全、精准检索、学习分析、简洁高效于一体的刷题平台显得尤为重要。       
      
作者在保留传统刷题平台的简洁高效实用的体验的前提下，添加了诸多创新性功能，为求职者准备一款结合了主流 AI 模拟面试官 + 构建学习文档、实时动力热点图、新颖的刷题模式、丰富高效的用户体验、markdown风格展示与实时编辑等等，大幅提高用户粘性和用户刷题效率，以及低用户使用成本，是区别于传统面试刷题平台且独立开发的全新平台。      

![USER](https://rich-tams.oss-cn-beijing.aliyuncs.com/RichInterview/762670a9db4628fd88446859d93479a5.png "user.jpg")   
![ADMIN](https://rich-tams.oss-cn-beijing.aliyuncs.com/RichInterview/b055f6763b1bdebf8e3ff9f23394091d.png "admin.jpg")   
        
# 核心优势         

• 阿里云百炼 API + 字节跳动火山 API 实现 AI 模拟面试官 + 构建学习文档       
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
• 阿里云百炼 API + 字节跳动火山 API     
       
# 前端      
       
• React 18服务端渲染 + Ant Design 组件库 + Ant Design Pro     
• Redux 状态管理        
• TypeScript + ESLint + Prettier 代码规范         
• OpenAPI 风格       

# 项目体验        

环境：谷歌浏览器、edge浏览器       
            
[（点击跳转）  Rich面试刷题平台 - 官网](http://暂不公布)      
               
# 部署项目

### 测试与开发环境

操作系统：win11

JAVA版本：jdk17（jdk8+）

Node版本：v20.17.0（v18.8.0+）

Nginx版本：1.26.3

### 源码部署

1.JDK 版本

JAVA 版本 - jdk17（jdk8+） Node 版本 - v20.17.0（v18.8.0+） Nginx 版本 - 1.26.3

2.数据库录入

运行项目内 SQL 脚本

3.启动附带中间件

（1）启动 Redis

在 【项目根目录\bat】 修改 Redis 启动脚本的启动路径为你的 Redis 本地路径，双击运行即可

（后续的中间件：本项目已实现接口降级逻辑 ，即使不部署中间件仍可启动，若您不想使用该功能，跳过即可）

（2）启动 nacos

在 【项目根目录\bat】 修改 nacos 启动脚本的启动路径为你的 nacos 本地路径，双击运行即可, 组件包可在 [（点击跳转）RichInterviewComponents ](https://github.com/Moo-Jie/RichInterviewComponents)   拉取

（3）启动 sentinel-dashboard-1.8.6.jar

在 【项目根目录\bat】 修改 sentinel 启动脚本的启动路径为 【项目根目录\lib\sentinel-dashboard-1.8.6.jar】，运行即可

（4）启动 Elasticsearch

双击【\elasticsearch-7.17.23\bin\elasticsearch.bat】, 组件包可在 [（点击跳转）RichInterviewComponents ](https://github.com/Moo-Jie/RichInterviewComponents)   拉取

（5）启动 Hot Key

部署请移步 [（点击跳转）RichInterview-JD-HotKey-components  ](https://github.com/Moo-Jie/RichInterview-JD-HotKey-components)     

4.调整【src/main/resources/application.yml】 的 Mysql、Redis 、x-file-storage、nacos、sa-token 等配置信息。

5.启动前后端即可
