-- MySQL dump 10.13  Distrib 8.0.35, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: richinterview_hotkey_db
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `biz_access_token`
--

DROP TABLE IF EXISTS `biz_access_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biz_access_token` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '' COMMENT 'token',
  `flag` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '' COMMENT 'flag',
  `CREATED_BY` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '创建人',
  `CREATED_TIME` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `UPDATED_BY` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '修改人',
  `UPDATED_TIME` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=COMPACT COMMENT='咚咚token表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biz_access_token`
--

LOCK TABLES `biz_access_token` WRITE;
/*!40000 ALTER TABLE `biz_access_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `biz_access_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hk_change_log`
--

DROP TABLE IF EXISTS `hk_change_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hk_change_log` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `biz_id` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL COMMENT '业务key',
  `biz_type` int NOT NULL COMMENT '业务类型：1规则变更；2worker变更',
  `from_str` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '原始值',
  `to_str` varchar(1024) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '目标值',
  `app_name` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '数据所属APP',
  `update_user` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '修改人',
  `create_time` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `uuid` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL COMMENT '防重ID',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_uuid` (`uuid`) USING BTREE COMMENT '防重索引'
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hk_change_log`
--

LOCK TABLES `hk_change_log` WRITE;
/*!40000 ALTER TABLE `hk_change_log` DISABLE KEYS */;
INSERT INTO `hk_change_log` VALUES (29,'RichInterview',1,'','{\"app\":\"RichInterview\",\"rules\":\"[\\n    {\\n        \\\"duration\\\": 600,\\n        \\\"key\\\": \\\"bank_detail_\\\",\\n        \\\"prefix\\\": true,\\n        \\\"interval\\\": 5,\\n        \\\"threshold\\\": 10,\\n        \\\"desc\\\": \\\"热门题库缓存\\\"\\n    }\\n]\",\"updateUser\":\"admin\"}','RichInterview','admin','2025-05-18 07:43:18','2025-05-18 15:43:17.6'),(30,'RichInterview',1,'[\n    {\n        \"duration\": 600,\n        \"key\": \"bank_detail_\",\n        \"prefix\": true,\n        \"interval\": 5,\n        \"threshold\": 10,\n        \"desc\": \"热门题库缓存\"\n    }\n]','{\"app\":\"RichInterview\",\"rules\":\"[\\n    {\\n        \\\"duration\\\": 600,\\n        \\\"key\\\": \\\"bank_detail_\\\",\\n        \\\"prefix\\\": true,\\n        \\\"interval\\\": 5,\\n        \\\"threshold\\\": 10,\\n        \\\"desc\\\": \\\"热门题库 HotKey 缓存\\\"\\n    }\\n]\",\"updateUser\":\"admin\"}','RichInterview','admin','2025-05-18 07:43:46','2025-05-18 15:43:46.48'),(31,'RichInterview',1,'[\n    {\n        \"duration\": 600,\n        \"key\": \"bank_detail_\",\n        \"prefix\": true,\n        \"interval\": 5,\n        \"threshold\": 10,\n        \"desc\": \"热门题库 HotKey 缓存\"\n    }\n]','{\"app\":\"RichInterview\",\"rules\":\"[\\n    {\\n        \\\"duration\\\": 600,\\n        \\\"key\\\": \\\"bank_detail_\\\",\\n        \\\"prefix\\\": true,\\n        \\\"interval\\\": 5,\\n        \\\"threshold\\\": 10,\\n        \\\"desc\\\": \\\"热门题库 HotKey 缓存：首先判断 bank_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key\\\"\\n    }\\n]\",\"updateUser\":\"admin\"}','RichInterview','admin','2025-05-18 07:48:55','2025-05-18 15:48:54.927'),(32,'RichInterview',1,'[\n    {\n        \"duration\": 600,\n        \"key\": \"bank_detail_\",\n        \"prefix\": true,\n        \"interval\": 5,\n        \"threshold\": 10,\n        \"desc\": \"热门题库 HotKey 缓存：首先判断 bank_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key\"\n    }\n]','{\"app\":\"RichInterview\",\"rules\":\"[\\n  {\\n    \\\"duration\\\": 600,\\n        \\\"key\\\": \\\"question_detail_\\\",\\n        \\\"prefix\\\": true,\\n        \\\"interval\\\": 5,\\n        \\\"threshold\\\": 10,\\n        \\\"desc\\\": \\\"热门题目 HotKey 缓存：首先判断 question_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key\\\"\\n  }\\n]\",\"updateUser\":\"RichInterview\"}','RichInterview','RichInterview','2025-05-18 08:17:00','2025-05-18 16:16:59.519'),(33,'RichInterview',1,'[\n  {\n    \"duration\": 600,\n        \"key\": \"question_detail_\",\n        \"prefix\": true,\n        \"interval\": 5,\n        \"threshold\": 10,\n        \"desc\": \"热门题目 HotKey 缓存：首先判断 question_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key\"\n  }\n]','{\"app\":\"RichInterview\",\"rules\":\"[\\n  {\\n    \\\"duration\\\": 600,\\n        \\\"key\\\": \\\"question_detail_\\\",\\n        \\\"prefix\\\": true,\\n        \\\"interval\\\": 5,\\n        \\\"threshold\\\": 10,\\n        \\\"desc\\\": \\\"热门题目 HotKey 缓存：首先判断 question_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key\\\"\\n  },\\n                  {\\n                    \\\"duration\\\": 600,\\n                        \\\"key\\\": \\\"bank_detail_\\\",\\n                        \\\"prefix\\\": true,\\n                        \\\"interval\\\": 5,\\n                        \\\"threshold\\\": 10,\\n                        \\\"desc\\\": \\\"热门题库 HotKey 缓存：首先判断 bank_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key\\\"\\n                  }\\n]\",\"updateUser\":\"RichInterview\"}','RichInterview','RichInterview','2025-05-18 08:18:27','2025-05-18 16:18:27.007'),(34,'RichInterview',1,'[\n  {\n    \"duration\": 600,\n        \"key\": \"question_detail_\",\n        \"prefix\": true,\n        \"interval\": 5,\n        \"threshold\": 10,\n        \"desc\": \"热门题目 HotKey 缓存：首先判断 question_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key\"\n  },\n                  {\n                    \"duration\": 600,\n                        \"key\": \"bank_detail_\",\n                        \"prefix\": true,\n                        \"interval\": 5,\n                        \"threshold\": 10,\n                        \"desc\": \"热门题库 HotKey 缓存：首先判断 bank_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key\"\n                  }\n]','{\"app\":\"RichInterview\",\"rules\":\"[\\n  {\\n    \\\"duration\\\": 600,\\n        \\\"key\\\": \\\"question_detail_\\\",\\n        \\\"prefix\\\": true,\\n        \\\"interval\\\": 5,\\n        \\\"threshold\\\": 10,\\n        \\\"desc\\\": \\\"热门题目 HotKey 缓存：首先判断 question_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key\\\"\\n  },\\n   {\\n        \\\"duration\\\": 600,\\n         \\\"key\\\": \\\"bank_detail_\\\",\\n          \\\"prefix\\\": true,\\n           \\\"interval\\\": 5,\\n            \\\"threshold\\\": 10,\\n            \\\"desc\\\": \\\"热门题库 HotKey 缓存：首先判断 bank_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key\\\"\\n     }\\n]\",\"updateUser\":\"RichInterview\"}','RichInterview','RichInterview','2025-05-18 08:19:04','2025-05-18 16:19:03.538');
/*!40000 ALTER TABLE `hk_change_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hk_key_record`
--

DROP TABLE IF EXISTS `hk_key_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hk_key_record` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `key_name` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT 'key',
  `app_name` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '所属appName',
  `val` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT 'value',
  `duration` int NOT NULL DEFAULT '60' COMMENT '缓存时间',
  `source` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '来源',
  `type` int NOT NULL DEFAULT '1' COMMENT '记录类型：1put；2del; -1unkonw',
  `create_time` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `uuid` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '防重ID',
  `rule` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '''' COMMENT '规则',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_key` (`uuid`) USING BTREE COMMENT '唯一索引'
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hk_key_record`
--

LOCK TABLES `hk_key_record` WRITE;
/*!40000 ALTER TABLE `hk_key_record` DISABLE KEYS */;
INSERT INTO `hk_key_record` VALUES (3,'bank_detail_1916344439735889921','RichInterview','RichInterview-bank_detail_',600,'SYSTEM',0,'2025-05-18 07:58:53','86786321-5a5c-4b3b-8fa5-6d671853db0a','\''),(4,'question_detail_1916348763044098049','RichInterview','RichInterview-question_detail_',600,'SYSTEM',0,'2025-05-18 08:21:14','8d24c72c-f5e1-4a6b-aa54-787f308e581e','\''),(5,'bank_detail_1916344439735889921','RichInterview','RichInterview-bank_detail_',600,'SYSTEM',0,'2025-05-18 08:21:41','73af187e-f316-4a6e-97ff-f121d071912b','\'');
/*!40000 ALTER TABLE `hk_key_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hk_key_timely`
--

DROP TABLE IF EXISTS `hk_key_timely`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hk_key_timely` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `key_name` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT 'key',
  `val` varchar(2048) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT 'value',
  `uuid` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '防重ID',
  `app_name` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '所属appName',
  `duration` int NOT NULL DEFAULT '0' COMMENT '缓存时间',
  `create_time` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_key` (`uuid`) USING BTREE COMMENT '唯一索引'
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hk_key_timely`
--

LOCK TABLES `hk_key_timely` WRITE;
/*!40000 ALTER TABLE `hk_key_timely` DISABLE KEYS */;
/*!40000 ALTER TABLE `hk_key_timely` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hk_rules`
--

DROP TABLE IF EXISTS `hk_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hk_rules` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `rules` varchar(5000) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '规则JSON',
  `app` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '所属APP',
  `update_user` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '修改人',
  `update_time` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `version` int NOT NULL DEFAULT '0' COMMENT '版本号',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_app` (`app`) USING BTREE COMMENT '防重索引'
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hk_rules`
--

LOCK TABLES `hk_rules` WRITE;
/*!40000 ALTER TABLE `hk_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `hk_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hk_statistics`
--

DROP TABLE IF EXISTS `hk_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hk_statistics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'keyName',
  `count` int NOT NULL COMMENT '计数',
  `app` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'app',
  `days` int NOT NULL COMMENT '天数',
  `hours` bigint NOT NULL COMMENT '小时数',
  `minutes` bigint NOT NULL DEFAULT '0' COMMENT '分钟数',
  `biz_type` int NOT NULL COMMENT '业务类型',
  `rule` varchar(180) COLLATE utf8mb4_bin NOT NULL COMMENT '所属规则',
  `uuid` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '防重ID',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_uuid` (`uuid`) USING BTREE COMMENT '防重唯一索引'
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hk_statistics`
--

LOCK TABLES `hk_statistics` WRITE;
/*!40000 ALTER TABLE `hk_statistics` DISABLE KEYS */;
INSERT INTO `hk_statistics` VALUES (1,'RichInterview-bank_detail_',1,'RichInterview',250518,25051815,2505181559,5,'\'','5_RichInterview-bank_detail__2505181559','2025-05-18 07:59:00'),(2,'bank_detail_1916344439735889921',1,'RichInterview',250518,25051816,0,1,'','1_bank_detail_1916344439735889921_25051816','2025-05-18 08:00:00'),(3,'RichInterview-bank_detail_',1,'RichInterview',250518,25051816,0,6,'\'','6_RichInterview-bank_detail__25051816','2025-05-18 08:00:00');
/*!40000 ALTER TABLE `hk_statistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hk_summary`
--

DROP TABLE IF EXISTS `hk_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hk_summary` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键',
  `index_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '指标名称',
  `rule` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '规则',
  `app` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT 'app',
  `index_val1` int NOT NULL DEFAULT '0' COMMENT '指标值1',
  `index_val2` int NOT NULL DEFAULT '0' COMMENT '指标值2',
  `index_val3` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '指标值3',
  `days` int NOT NULL DEFAULT '0' COMMENT '天数',
  `hours` int NOT NULL DEFAULT '0' COMMENT '小时数',
  `minutes` bigint NOT NULL DEFAULT '0' COMMENT '分钟数',
  `seconds` bigint NOT NULL DEFAULT '0' COMMENT '秒数',
  `biz_type` tinyint NOT NULL DEFAULT '0' COMMENT '类型',
  `uuid` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '防重ID',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_uuid` (`uuid`) USING BTREE COMMENT '防重索引',
  KEY `idx_apprule` (`app`,`rule`) USING BTREE COMMENT '查询索引',
  KEY `ix_ct` (`create_time`) USING BTREE COMMENT '时间索引'
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin ROW_FORMAT=COMPACT COMMENT='汇总表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hk_summary`
--

LOCK TABLES `hk_summary` WRITE;
/*!40000 ALTER TABLE `hk_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `hk_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hk_user`
--

DROP TABLE IF EXISTS `hk_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hk_user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'id',
  `nick_name` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '昵称',
  `user_name` varchar(32) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '用户名',
  `pwd` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '密码',
  `phone` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '手机号',
  `role` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '角色：ADMIN-超管，APPADMIN-app管理员，APPUSER-app用户',
  `app_name` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL DEFAULT '' COMMENT '所属appName',
  `create_time` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `state` int NOT NULL DEFAULT '1' COMMENT '状态：1可用；0冻结',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_userName` (`user_name`) USING BTREE COMMENT '账号唯一索引'
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin ROW_FORMAT=COMPACT;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hk_user`
--

LOCK TABLES `hk_user` WRITE;
/*!40000 ALTER TABLE `hk_user` DISABLE KEYS */;
INSERT INTO `hk_user` VALUES (2,'admin','admin','e10adc3949ba59abbe56e057f20f883e','15966279907','ADMIN','','2025-05-18 15:15:50',1),(4,'RichInterview','RichInterview','827ccb0eea8a706c4c34a16891f84e7b','15966279907','APPADMIN','RichInterview','2025-05-18 07:15:35',1);
/*!40000 ALTER TABLE `hk_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-25 18:04:48
