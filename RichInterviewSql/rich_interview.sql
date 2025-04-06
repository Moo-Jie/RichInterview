-- MySQL dump 10.13  Distrib 8.0.35, for Win64 (x86_64)
-- RIchInterview初始数据库（测试用）
-- Host: 127.0.0.1    Database: rich_interview
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
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `title` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标题',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT '内容',
  `tags` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标签列表（json 数组）',
  `answer` text COLLATE utf8mb4_unicode_ci COMMENT '推荐答案',
  `userId` bigint NOT NULL COMMENT '创建用户 id',
  `editTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '编辑时间',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除',
  `reviewStatus` int NOT NULL DEFAULT '0' COMMENT '状态：0-待审核, 1-通过, 2-拒绝',
  `reviewMessage` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '审核信息',
  `reviewerId` bigint DEFAULT NULL COMMENT '审核人 id',
  `reviewTime` datetime DEFAULT NULL COMMENT '审核时间',
  `viewNum` int NOT NULL DEFAULT '0' COMMENT '浏览量',
  `thumbNum` int NOT NULL DEFAULT '0' COMMENT '点赞数',
  `favourNum` int NOT NULL DEFAULT '0' COMMENT '收藏数',
  `priority` int NOT NULL DEFAULT '0' COMMENT '优先级',
  `source` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '题目来源',
  `needVip` tinyint NOT NULL DEFAULT '0' COMMENT '仅会员可见（1 表示仅会员可见）',
  PRIMARY KEY (`id`),
  KEY `idx_title` (`title`),
  KEY `idx_userId` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=1902684467592515586 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;
/*!40000 ALTER TABLE `question` DISABLE KEYS */;
INSERT INTO `question` VALUES (1902684467592515585,'欢迎来到面试题目练习网站','快来看看新手福利吧','[\"JAVA\",\"spring\",\"redis\"]','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',1902684382846603265,'2025-03-20 19:31:41','2025-03-20 19:31:41','2025-03-20 19:40:16',0,0,NULL,NULL,NULL,0,0,0,0,NULL,0);
/*!40000 ALTER TABLE `question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_bank`
--

DROP TABLE IF EXISTS `question_bank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_bank` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `title` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标题',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '描述',
  `picture` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '图片',
  `userId` bigint NOT NULL COMMENT '创建用户 id',
  `editTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '编辑时间',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除',
  `reviewStatus` int NOT NULL DEFAULT '0' COMMENT '状态：0-待审核, 1-通过, 2-拒绝',
  `reviewMessage` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '审核信息',
  `reviewerId` bigint DEFAULT NULL COMMENT '审核人 id',
  `reviewTime` datetime DEFAULT NULL COMMENT '审核时间',
  `priority` int NOT NULL DEFAULT '0' COMMENT '优先级',
  `viewNum` int NOT NULL DEFAULT '0' COMMENT '浏览量',
  PRIMARY KEY (`id`),
  KEY `idx_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题库';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_bank`
--

LOCK TABLES `question_bank` WRITE;
/*!40000 ALTER TABLE `question_bank` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_bank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_bank_question`
--

DROP TABLE IF EXISTS `question_bank_question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_bank_question` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `questionBankId` bigint NOT NULL COMMENT '题库 id',
  `questionId` bigint NOT NULL COMMENT '题目 id',
  `userId` bigint NOT NULL COMMENT '创建用户 id',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `questionOrder` int NOT NULL DEFAULT '0' COMMENT '题目顺序（题号）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `questionBankId` (`questionBankId`,`questionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题库题目';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_bank_question`
--

LOCK TABLES `question_bank_question` WRITE;
/*!40000 ALTER TABLE `question_bank_question` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_bank_question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `userAccount` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '账号',
  `userPassword` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `unionId` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '微信开放平台id',
  `mpOpenId` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '公众号openId',
  `userName` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户昵称',
  `userAvatar` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户头像',
  `userProfile` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户简介',
  `userRole` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user' COMMENT '用户角色：user/admin/ban',
  `editTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '编辑时间',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isDelete` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除',
  `vipExpireTime` datetime DEFAULT NULL COMMENT '会员过期时间',
  `vipCode` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '会员兑换码',
  `vipNumber` bigint DEFAULT NULL COMMENT '会员编号',
  `shareCode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '分享码',
  `inviteUser` bigint DEFAULT NULL COMMENT '邀请用户 id',
  PRIMARY KEY (`id`),
  KEY `idx_unionId` (`unionId`)
) ENGINE=InnoDB AUTO_INCREMENT=1902684382846603266 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1901923584276791298,'rich','b03d227f78c0c79334fca76e7b8eb46a',NULL,NULL,'杜瑞持',NULL,'测试用户','user','2025-03-18 17:08:13','2025-03-18 17:08:13','2025-03-20 19:49:20',0,NULL,NULL,NULL,NULL,NULL),(1902684382846603265,'admin','9665755c5e91617ffd8b936710dc243f',NULL,NULL,'杜瑞持',NULL,'管理员账户','user','2025-03-20 19:31:21','2025-03-20 19:31:21','2025-03-20 19:49:20',0,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-20 19:57:56
