-- MySQL dump 10.13  Distrib 8.0.41, for macos14.7 (arm64)
--
-- Host: localhost    Database: youlai_boot
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT = @@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS = @@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION = @@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE = @@TIME_ZONE */;
/*!40103 SET TIME_ZONE = '+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0 */;
/*!40101 SET @OLD_SQL_MODE = @@SQL_MODE, SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES = @@SQL_NOTES, SQL_NOTES = 0 */;

--
-- Table structure for table `gen_config`
--

DROP TABLE IF EXISTS `gen_config`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gen_config`
(
    `id`             bigint       NOT NULL AUTO_INCREMENT,
    `table_name`     varchar(100) NOT NULL COMMENT '表名',
    `module_name`    varchar(100) DEFAULT NULL COMMENT '模块名',
    `package_name`   varchar(255) NOT NULL COMMENT '包名',
    `business_name`  varchar(100) NOT NULL COMMENT '业务名',
    `entity_name`    varchar(100) NOT NULL COMMENT '实体类名',
    `author`         varchar(50)  NOT NULL COMMENT '作者',
    `parent_menu_id` bigint       DEFAULT NULL COMMENT '上级菜单ID，对应sys_menu的id ',
    `create_time`    datetime     DEFAULT NULL COMMENT '创建时间',
    `update_time`    datetime     DEFAULT NULL COMMENT '更新时间',
    `is_deleted`     bit(1)       DEFAULT b'0' COMMENT '是否删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_tablename` (`table_name`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 2
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='代码生成基础配置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gen_config`
--

LOCK TABLES `gen_config` WRITE;
/*!40000 ALTER TABLE `gen_config`
    DISABLE KEYS */;
INSERT INTO `gen_config`
VALUES (1, 'pms_spu', 'system', 'com.youlai.boot', '商品', 'PmsSpu', 'youlaitech', NULL, '2025-03-04 22:51:20',
        '2025-03-04 22:51:20', _binary '\0');
/*!40000 ALTER TABLE `gen_config`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gen_field_config`
--

DROP TABLE IF EXISTS `gen_field_config`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gen_field_config`
(
    `id`               bigint       NOT NULL AUTO_INCREMENT,
    `config_id`        bigint       NOT NULL COMMENT '关联的配置ID',
    `column_name`      varchar(100) DEFAULT NULL,
    `column_type`      varchar(50)  DEFAULT NULL,
    `column_length`    int          DEFAULT NULL,
    `field_name`       varchar(100) NOT NULL COMMENT '字段名称',
    `field_type`       varchar(100) DEFAULT NULL COMMENT '字段类型',
    `field_sort`       int          DEFAULT NULL COMMENT '字段排序',
    `field_comment`    varchar(255) DEFAULT NULL COMMENT '字段描述',
    `max_length`       int          DEFAULT NULL,
    `is_required`      tinyint(1)   DEFAULT NULL COMMENT '是否必填',
    `is_show_in_list`  tinyint(1)   DEFAULT '0' COMMENT '是否在列表显示',
    `is_show_in_form`  tinyint(1)   DEFAULT '0' COMMENT '是否在表单显示',
    `is_show_in_query` tinyint(1)   DEFAULT '0' COMMENT '是否在查询条件显示',
    `query_type`       tinyint      DEFAULT NULL COMMENT '查询方式',
    `form_type`        tinyint      DEFAULT NULL COMMENT '表单类型',
    `dict_type`        varchar(50)  DEFAULT NULL COMMENT '字典类型',
    `create_time`      datetime     DEFAULT NULL COMMENT '创建时间',
    `update_time`      datetime     DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `config_id` (`config_id`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 16
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='代码生成字段配置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gen_field_config`
--

LOCK TABLES `gen_field_config` WRITE;
/*!40000 ALTER TABLE `gen_field_config`
    DISABLE KEYS */;
INSERT INTO `gen_field_config`
VALUES (1, 1, 'id', 'bigint', NULL, 'id', 'Long', 1, '主键', NULL, 1, 1, 1, 0, 1, 1, NULL, '2025-03-04 22:51:20',
        '2025-03-04 22:51:20'),
       (2, 1, 'name', 'varchar', NULL, 'name', 'String', 2, '商品名称', 64, 1, 1, 1, 0, 1, 1, NULL,
        '2025-03-04 22:51:20', '2025-03-04 22:51:20'),
       (3, 1, 'category_id', 'bigint', NULL, 'categoryId', 'Long', 3, '商品类型ID', NULL, 1, 1, 1, 0, 1, 1, NULL,
        '2025-03-04 22:51:20', '2025-03-04 22:51:20'),
       (4, 1, 'brand_id', 'bigint', NULL, 'brandId', 'Long', 4, '商品品牌ID', NULL, 0, 1, 1, 0, 1, 1, NULL,
        '2025-03-04 22:51:20', '2025-03-04 22:51:20'),
       (5, 1, 'origin_price', 'bigint', NULL, 'originPrice', 'Long', 5, '原价【起】', NULL, 1, 1, 1, 0, 1, 1, NULL,
        '2025-03-04 22:51:20', '2025-03-04 22:51:20'),
       (6, 1, 'price', 'bigint', NULL, 'price', 'Long', 6, '现价【起】', NULL, 1, 1, 1, 0, 1, 1, NULL,
        '2025-03-04 22:51:20', '2025-03-04 22:51:20'),
       (7, 1, 'sales', 'int', NULL, 'sales', 'Integer', 7, '销量', NULL, 0, 1, 1, 0, 1, 1, NULL, '2025-03-04 22:51:20',
        '2025-03-04 22:51:20'),
       (8, 1, 'pic_url', 'varchar', NULL, 'picUrl', 'String', 8, '商品主图', 255, 0, 1, 1, 0, 1, 1, NULL,
        '2025-03-04 22:51:20', '2025-03-04 22:51:20'),
       (9, 1, 'album', 'json', NULL, 'album', 'String', 9, '商品图册', NULL, 0, 1, 1, 0, 1, 1, NULL,
        '2025-03-04 22:51:20', '2025-03-04 22:51:20'),
       (10, 1, 'unit', 'varchar', NULL, 'unit', 'String', 10, '单位', 16, 0, 1, 1, 0, 1, 1, NULL, '2025-03-04 22:51:20',
        '2025-03-04 22:51:20'),
       (11, 1, 'description', 'varchar', NULL, 'description', 'String', 11, '商品简介', 255, 0, 1, 1, 0, 1, 1, NULL,
        '2025-03-04 22:51:20', '2025-03-04 22:51:20'),
       (12, 1, 'detail', 'text', NULL, 'detail', 'String', 12, '商品详情', 65535, 0, 1, 1, 0, 1, 1, NULL,
        '2025-03-04 22:51:20', '2025-03-04 22:51:20'),
       (13, 1, 'status', 'tinyint', NULL, 'status', 'Integer', 13, '商品状态(0:下架 1:上架)', NULL, 0, 1, 1, 0, 1, 1,
        NULL, '2025-03-04 22:51:20', '2025-03-04 22:51:20'),
       (14, 1, 'create_time', 'datetime', NULL, 'createTime', 'LocalDateTime', 14, '创建时间', NULL, 0, 1, 1, 0, 1, 9,
        NULL, '2025-03-04 22:51:20', '2025-03-04 22:51:20'),
       (15, 1, 'update_time', 'datetime', NULL, 'updateTime', 'LocalDateTime', 15, '更新时间', NULL, 0, 1, 1, 0, 1, 9,
        NULL, '2025-03-04 22:51:20', '2025-03-04 22:51:20');
/*!40000 ALTER TABLE `gen_field_config`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pms_brand`
--

DROP TABLE IF EXISTS `pms_brand`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pms_brand`
(
    `id`          bigint                                                       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name`        varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '品牌名称',
    `logo_url`    varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'LOGO图片',
    `sort`        int                                                           DEFAULT NULL COMMENT '排序',
    `create_time` datetime                                                      DEFAULT NULL COMMENT '创建时间',
    `update_time` datetime                                                      DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 34
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  ROW_FORMAT = DYNAMIC COMMENT ='商品品牌表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pms_brand`
--

LOCK TABLES `pms_brand` WRITE;
/*!40000 ALTER TABLE `pms_brand`
    DISABLE KEYS */;
INSERT INTO `pms_brand`
VALUES (1, '有来', 'http://a.youlai.tech:9000/default/5409e3deb5a14b8fa8cb4275dee0e25d.png', 1, '2021-07-11 19:56:58',
        '2021-07-11 20:02:54'),
       (10, '小米', 'http://a.youlai.tech:9000/default/6a5a606fc60742919149a7861bf26cd5.jpg', 2, '2022-03-05 16:12:16',
        '2022-03-05 16:12:16'),
       (11, '华硕', 'http://a.youlai.tech:9000/default/f18083f95e104a0bae3c587dee3bb2ed.png', 3, '2022-03-05 16:12:16',
        '2022-03-05 16:12:16'),
       (20, '华为', 'https://oss.youlai.tech/default/ff61bd639b23491d8f2aa85d09fcf788.jpg', 1, '2022-05-06 23:08:33',
        '2022-05-06 23:08:33'),
       (33, '惠普', 'https://oss.youlai.tech/default/4cf579add9544c6eaafb41ce1131559e.gif', 1, '2022-07-07 00:12:16',
        '2022-07-07 00:12:16');
/*!40000 ALTER TABLE `pms_brand`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pms_category`
--

DROP TABLE IF EXISTS `pms_category`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pms_category`
(
    `id`          bigint                                                       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name`        varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '商品分类名称',
    `parent_id`   bigint                                                       NOT NULL COMMENT '父级ID',
    `level`       int                                                           DEFAULT NULL COMMENT '层级',
    `icon_url`    varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '图标地址',
    `sort`        int                                                           DEFAULT NULL COMMENT '排序',
    `visible`     tinyint(1)                                                    DEFAULT '1' COMMENT '显示状态:( 0:隐藏 1:显示)',
    `create_time` datetime                                                      DEFAULT NULL COMMENT '创建时间',
    `update_time` datetime                                                      DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 102
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  ROW_FORMAT = DYNAMIC COMMENT ='商品分类表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pms_category`
--

LOCK TABLES `pms_category` WRITE;
/*!40000 ALTER TABLE `pms_category`
    DISABLE KEYS */;
INSERT INTO `pms_category`
VALUES (3, '手机配件', 0, 1, NULL, 2, 1, NULL, '2022-07-07 22:56:53'),
       (4, '智能手机', 3, 2, NULL, 1, 1, NULL, NULL),
       (5, '5g手机', 4, 3, 'https://oss.youlai.tech/default/6ffb37110ac2434a9882b9e8968b2887.jpg', 1, 1, NULL,
        '2022-07-08 00:28:38'),
       (6, '电脑办公', 0, 1, 'https://www.youlai.tech/files/default/776c21c1a71848069093033f461c5f4a.jpg', 1, 1,
        '2022-02-25 11:22:44', '2022-07-07 22:56:38'),
       (97, '笔记本电脑', 6, 2, NULL, 100, 1, '2022-07-08 00:10:27', '2022-07-08 00:10:27'),
       (99, '三星轻薄本', 97, 3, 'https://oss.youlai.tech/default/2f849b96ebb54ab3a94b1b90137f1b4d.png', 100, 1,
        '2022-07-08 00:14:03', '2022-07-08 00:26:52'),
       (100, '全能本', 97, 3, 'https://oss.youlai.tech/default/37cc080ec61b4ce7b0583b002568ebaa.png', 100, 1,
        '2022-07-08 00:14:10', '2022-07-08 00:27:01'),
       (101, '游戏本', 97, 3, 'https://oss.youlai.tech/default/5c1a2d5427534b48bc382caa55197f11.png', 100, 1,
        '2022-07-08 00:14:18', '2022-07-08 00:27:11');
/*!40000 ALTER TABLE `pms_category`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pms_category_attribute`
--

DROP TABLE IF EXISTS `pms_category_attribute`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pms_category_attribute`
(
    `id`          bigint                                                       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `category_id` bigint                                                       NOT NULL COMMENT '分类ID',
    `name`        varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '属性名称',
    `type`        tinyint                                                      NOT NULL COMMENT '类型(1:规格;2:属性;)',
    `create_time` datetime DEFAULT NULL COMMENT '创建时间',
    `update_time` datetime DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `fk_pms_attr_pms_category` (`category_id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 183
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  ROW_FORMAT = DYNAMIC COMMENT ='商品属性表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pms_category_attribute`
--

LOCK TABLES `pms_category_attribute` WRITE;
/*!40000 ALTER TABLE `pms_category_attribute`
    DISABLE KEYS */;
INSERT INTO `pms_category_attribute`
VALUES (34, 5, '颜色', 1, '2021-07-11 17:57:06', '2022-07-01 00:08:19'),
       (35, 5, '规格', 1, '2021-07-11 18:00:06', '2022-07-01 00:08:19'),
       (36, 5, '上市时间', 2, '2021-07-11 18:00:08', '2022-06-01 17:41:05');
/*!40000 ALTER TABLE `pms_category_attribute`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pms_category_brand`
--

DROP TABLE IF EXISTS `pms_category_brand`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pms_category_brand`
(
    `category_id` bigint NOT NULL,
    `brand_id`    bigint NOT NULL,
    PRIMARY KEY (`category_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  ROW_FORMAT = DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pms_category_brand`
--

LOCK TABLES `pms_category_brand` WRITE;
/*!40000 ALTER TABLE `pms_category_brand`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `pms_category_brand`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pms_sku`
--

DROP TABLE IF EXISTS `pms_sku`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pms_sku`
(
    `id`           bigint NOT NULL AUTO_INCREMENT,
    `sku_sn`       varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci  DEFAULT NULL COMMENT '商品编码',
    `spu_id`       bigint NOT NULL COMMENT 'SPU ID',
    `name`         varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '商品名称',
    `spec_ids`     varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '商品规格值，以英文逗号(,)分割',
    `price`        bigint                                                        DEFAULT NULL COMMENT '商品价格(单位：分)',
    `stock`        int unsigned                                                  DEFAULT NULL COMMENT '库存数量',
    `locked_stock` int                                                           DEFAULT NULL COMMENT '库存锁定数量',
    `pic_url`      varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '商品图片地址',
    `create_time`  datetime                                                      DEFAULT NULL COMMENT '创建时间',
    `update_time`  datetime                                                      DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `fk_pms_sku_pms_spu` (`spu_id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 755
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  ROW_FORMAT = DYNAMIC COMMENT ='商品库存表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pms_sku`
--

LOCK TABLES `pms_sku` WRITE;
/*!40000 ALTER TABLE `pms_sku`
    DISABLE KEYS */;
INSERT INTO `pms_sku`
VALUES (1, 'sn001', 1, '黑 6+128g', '1_3', 399900, 990, 150,
        'https://www.youlai.tech/files/default/c25b39470474494485633c49101a0f5d.png', '2021-08-08 00:43:26',
        '2022-07-03 14:16:16'),
       (2, 'sn002', 1, '黑 8+256g', '1_4', 499900, 999, 0,
        'https://www.youlai.tech/files/default/c25b39470474494485633c49101a0f5d.png', '2021-08-08 00:43:26',
        '2022-07-03 14:16:16'),
       (3, 'sn003', 1, '蓝 6+128g', '216_3', 399900, 999, 0,
        'https://www.youlai.tech/files/default/835d73a337964b9b97e5c7c90acc8cb2.png', '2022-03-05 09:25:53',
        '2022-07-03 14:16:16'),
       (4, 'sn004', 1, '蓝 8+256g', '216_4', 499900, 999, 0,
        'https://www.youlai.tech/files/default/835d73a337964b9b97e5c7c90acc8cb2.png', '2022-03-05 09:25:53',
        '2022-07-03 14:16:16'),
       (5, '10000001', 2, '魔幻青 RTX3060/i7-12700H/165Hz 2.5K屏', '256_258', 1025000, 998, 0,
        'http://a.youlai.tech:9000/default/8815c9a46fcc4b1ea952623406750da5.jpg', '2022-03-11 14:39:21',
        '2022-07-08 00:29:56'),
       (6, '10000002', 2, '魔幻青 RTX3050tTi/12代i5/144Hz高色域屏', '256_259', 925000, 999, 0,
        'http://a.youlai.tech:9000/default/8815c9a46fcc4b1ea952623406750da5.jpg', '2022-03-11 14:39:21',
        '2022-07-08 00:29:56'),
       (7, '10000003', 2, '日蚀灰 RTX3060/i7-12700H/165Hz 2.5K屏', '257_258', 1025000, 999, 0,
        'http://a.youlai.tech:9000/default/3210cd1ffb6c4346b743a10855d3cb37.jpg', '2022-03-11 14:39:21',
        '2022-07-08 00:29:56'),
       (8, '10000004', 2, '日蚀灰 RTX3050tTi/12代i5/144Hz高色域屏', '257_259', 925000, 999, 0,
        'http://a.youlai.tech:9000/default/3210cd1ffb6c4346b743a10855d3cb37.jpg', '2022-03-11 14:39:21',
        '2022-07-08 00:29:56'),
       (9, '111', 3, '16g 512g 【2022款】锐龙六核R5-6600U/核芯显卡/100%sRGB高色域', '841_843_845', 589900, 992, 1,
        'https://oss.youlai.tech/youlai-boot/2023/06/08/78b8efecb753426f81e5dcfcd175495f.jpg', '2022-07-07 00:22:13',
        '2022-07-08 00:29:41'),
       (10, '112', 3, '16g 512g 【2022款】锐龙八核R7-6800U/核芯显卡/100%sRGB高色域', '841_843_846', 629900, 999, 0,
        'https://oss.youlai.tech/youlai-boot/2023/06/08/93cbc9dc6fe144f5a59793a6248479a0.jpg', '2022-07-07 00:22:13',
        '2022-07-08 00:29:41'),
       (11, '113', 3, '16g 1t 【2022款】锐龙六核R5-6600U/核芯显卡/100%sRGB高色域', '841_844_845', 639900, 999, 0,
        'https://oss.youlai.tech/youlai-boot/2023/06/08/78b8efecb753426f81e5dcfcd175495f.jpg', '2022-07-07 00:22:13',
        '2022-07-08 00:29:41'),
       (12, '114', 3, '16g 1t 【2022款】锐龙八核R7-6800U/核芯显卡/100%sRGB高色域', '841_844_846', 639900, 999, 0,
        'https://oss.youlai.tech/youlai-boot/2023/06/08/93cbc9dc6fe144f5a59793a6248479a0.jpg', '2022-07-07 00:22:13',
        '2022-07-08 00:29:41'),
       (13, '115', 3, '32g 512g 【2022款】锐龙六核R5-6600U/核芯显卡/100%sRGB高色域', '842_843_845', 589900, 999, 0,
        'https://oss.youlai.tech/youlai-boot/2023/06/08/78b8efecb753426f81e5dcfcd175495f.jpg', '2022-07-07 00:22:13',
        '2022-07-08 00:29:41'),
       (14, '116', 3, '32g 512g 【2022款】锐龙八核R7-6800U/核芯显卡/100%sRGB高色域', '842_843_846', 629900, 999, 0,
        'https://oss.youlai.tech/youlai-boot/2023/06/08/93cbc9dc6fe144f5a59793a6248479a0.jpg', '2022-07-07 00:22:13',
        '2022-07-08 00:29:41'),
       (15, '117', 3, '32g 1t 【2022款】锐龙六核R5-6600U/核芯显卡/100%sRGB高色域', '842_844_845', 639900, 999, 0,
        'https://oss.youlai.tech/youlai-boot/2023/06/08/78b8efecb753426f81e5dcfcd175495f.jpg', '2022-07-07 00:22:13',
        '2022-07-08 00:29:41'),
       (16, '118', 3, '32g 1t 【2022款】锐龙八核R7-6800U/核芯显卡/100%sRGB高色域', '842_844_846', 639900, 999, 0,
        'https://oss.youlai.tech/youlai-boot/2023/06/08/93cbc9dc6fe144f5a59793a6248479a0.jpg', '2022-07-07 00:22:13',
        '2022-07-08 00:29:41'),
       (17, 'sn001', 4, '黑 6+128g', '1_3', 399900, 999, 0,
        'https://oss.youlai.tech/youlai-boot/2023/06/08/6b83dd33eaa248ed8e11cff0003287ee.jpg', '2021-08-08 00:43:26',
        '2022-07-03 14:16:16');
/*!40000 ALTER TABLE `pms_sku`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pms_spu`
--

DROP TABLE IF EXISTS `pms_spu`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pms_spu`
(
    `id`           bigint                                                       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name`         varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '商品名称',
    `category_id`  bigint                                                       NOT NULL COMMENT '商品类型ID',
    `brand_id`     bigint                                                        DEFAULT NULL COMMENT '商品品牌ID',
    `origin_price` bigint                                                       NOT NULL COMMENT '原价【起】',
    `price`        bigint                                                       NOT NULL COMMENT '现价【起】',
    `sales`        int                                                           DEFAULT '0' COMMENT '销量',
    `pic_url`      varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '商品主图',
    `album`        json                                                          DEFAULT NULL COMMENT '商品图册',
    `unit`         varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci  DEFAULT NULL COMMENT '单位',
    `description`  varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '商品简介',
    `detail`       text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '商品详情',
    `status`       tinyint                                                       DEFAULT '1' COMMENT '商品状态(0:下架 1:上架)',
    `create_time`  datetime                                                      DEFAULT NULL COMMENT '创建时间',
    `update_time`  datetime                                                      DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `fk_pms_spu_pms_brand` (`brand_id`) USING BTREE,
    KEY `fk_pms_spu_pms_category` (`category_id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 288
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  ROW_FORMAT = DYNAMIC COMMENT ='商品表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pms_spu`
--

LOCK TABLES `pms_spu` WRITE;
/*!40000 ALTER TABLE `pms_spu`
    DISABLE KEYS */;
INSERT INTO `pms_spu`
VALUES (1, 'Galaxy Z Fold5', 5, 10, 599900, 599900, 1,
        'https://shop-image.samsung.com.cn/productv5/img/2023/07/26/64c0e30fe4b08db29258c50c.png', '[
    \"https://shop-image.samsung.com.cn/productv5/img/2023/07/26/64c0e30fe4b08db29258c50c.png\"
  ]', '台',
        '好快,好稳,\n好一次强上加强。\n高通全新一代芯片赋能，速度大幅提升。\n三大专业主摄影像加持，能力全面进化。\n大师级设计理念新诠释，质感简而不凡。\n斩获十五项纪录旗舰屏，感官万般出众。',
        '<p><img src=\"https://shop-image.samsung.com.cn/productv5/img/2023/11/03/65449d3ee4b08db20823bcbe.jpg\" alt=\"\" data-href=\"\" style=\"width: 449.00px;height: 449.00px;\"/></p>',
        1, NULL, '2022-07-03 14:16:16'),
       (2, '华硕天选11', 101, 11, 1145000, 929900, 0,
        'https://www.youlai.tech/files/default/d97457b3fd7d4aef8846da96fe032bf8.jpg', '[
         \"https://www.youlai.tech/files/default/3edd01c723ff456384cea9bd3c9b19e7.jpg\",
         \"https://www.youlai.tech/files/default/a6681c18fc294ee49efb8e121b8e943f.jpg\",
         \"https://www.youlai.tech/files/default/97458ae9ea734bc498724660abb1c6cd.jpg\",
         \"https://www.youlai.tech/files/default/501b0e6dcb3f4d69b7e40e90b3d3ac32.jpg\"
       ]', NULL,
        '中国台湾华硕电脑股份有限公司 [1]  是当前全球第一大主板生产商、全球第三大显卡生产商，同时也是全球领先的3C解决方案提供商之一，致力于为个人和企业用户提供最具创新价值的产品及应用方案。华硕的产品线完整覆盖至笔记本电脑、主板、显卡、服务器、光存储、有线/无线网络通讯产品、LCD、掌上电脑、智能手机等全线3C产品。其中显卡和主板以及笔记本电脑三大产品已经成为华硕的主要竞争实力。',
        '<p><img src=\"http://a.youlai.tech:9000/default/5e4fb81b04244a74aacaabb4685101e2.png\" alt=\"\" data-href=\"\" width=\"\" height=\"\" style=\"\"/><img src=\"http://a.youlai.tech:9000/default/0744c5b6d77b47b294eb111ee992c62b.png\" alt=\"\" data-href=\"\" width=\"\" height=\"\" style=\"\"/></p>',
        1, '2022-03-11 14:39:21', '2025-03-23 21:42:37'),
       (3, '惠普战X ', 99, 33, 639900, 629900, 0,
        'https://oss.youlai.tech/default/e59859e0effb4b66a0f7380ff5369d66.jpg', '[
         \"https://oss.youlai.tech/default/de9c5625e35b4c0aa9888c48d4def446.jpg\"
       ]', NULL,
        '【2022新款】HP/惠普战X 16英寸锐龙新款6000系列R5六核/R7八核高性能学生家用轻薄办公商用笔记本电脑\n六核/八核处理器，高性能集成显卡',
        '<p><img src=\"https://oss.youlai.tech/default/d645a6f642794e2183cc44d340613b9d.jpg\" alt=\"\" data-href=\"\" style=\"\"/></p>',
        1, '2022-07-07 00:22:13', '2022-07-08 00:29:41'),
       (4, '小米13', 5, 10, 599900, 599900, 1,
        'https://oss.youlai.tech/youlai-boot/2023/06/08/6b83dd33eaa248ed8e11cff0003287ee.jpg', '[
         \"https://oss.youlai.tech/youlai-boot/2023/06/08/6b83dd33eaa248ed8e11cff0003287ee.jpg\"
       ]', '台',
        '好快,好稳,\n好一次强上加强。\n高通全新一代芯片赋能，速度大幅提升。\n三大专业主摄影像加持，能力全面进化。\n大师级设计理念新诠释，质感简而不凡。\n斩获十五项纪录旗舰屏，感官万般出众。',
        '<p><img src=\"http://a.youlai.tech:9000/default/1a69357664c24962ac23953905c3c38f.png\" alt=\"\" data-href=\"\" style=\"width: 449.00px;height: 449.00px;\"/></p>',
        1, NULL, '2022-07-03 14:16:16');
/*!40000 ALTER TABLE `pms_spu`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pms_spu_attribute`
--

DROP TABLE IF EXISTS `pms_spu_attribute`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pms_spu_attribute`
(
    `id`           bigint                                                        NOT NULL AUTO_INCREMENT COMMENT '主键',
    `spu_id`       bigint                                                        NOT NULL COMMENT '产品ID',
    `attribute_id` bigint                                                        DEFAULT NULL COMMENT '属性ID',
    `name`         varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci  NOT NULL COMMENT '属性名称',
    `value`        varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '属性值',
    `type`         tinyint                                                       NOT NULL COMMENT '类型(1:规格;2:属性;)',
    `pic_url`      varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '规格图片',
    `create_time`  datetime                                                      DEFAULT NULL COMMENT '创建时间',
    `update_time`  datetime                                                      DEFAULT NULL COMMENT '更新时间',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `fk_pms_spu_attribute_pms_attr` (`name`) USING BTREE,
    KEY `fk_pms_spu_attribute_pms_spu` (`spu_id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 847
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci
  ROW_FORMAT = DYNAMIC COMMENT ='商品属性/规格表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pms_spu_attribute`
--

LOCK TABLES `pms_spu_attribute` WRITE;
/*!40000 ALTER TABLE `pms_spu_attribute`
    DISABLE KEYS */;
INSERT INTO `pms_spu_attribute`
VALUES (1, 1, 34, '颜色', '黑', 1, 'https://www.youlai.tech/files/default/c25b39470474494485633c49101a0f5d.png', NULL,
        '2022-07-03 14:16:16'),
       (3, 1, 35, '规格', '6+128g', 1, NULL, NULL, '2022-07-03 14:16:16'),
       (4, 1, 35, '规格', '8+256g', 1, NULL, NULL, '2022-07-03 14:16:16'),
       (5, 1, 36, '上市时间', '2021-07-17', 2, NULL, NULL, '2022-07-03 14:16:16'),
       (216, 1, NULL, '颜色', '蓝', 1, 'https://www.youlai.tech/files/default/835d73a337964b9b97e5c7c90acc8cb2.png',
        '2022-03-05 09:25:53', '2022-07-03 14:16:16'),
       (251, 2, NULL, '上市时间', '2022/3/11', 2, NULL, '2022-03-11 14:39:21', '2022-07-08 00:29:56'),
       (252, 2, NULL, '商品名称', '华硕天选3', 2, NULL, '2022-03-11 14:39:21', '2022-07-08 00:29:56'),
       (253, 2, NULL, '商品编号', '100032610338', 2, NULL, '2022-03-11 14:39:21', '2022-07-08 00:29:56'),
       (254, 2, NULL, '商品毛重', '4.05kg', 2, NULL, '2022-03-11 14:39:21', '2022-07-08 00:29:56'),
       (255, 2, NULL, '系统', 'windows11', 2, NULL, '2022-03-11 14:39:21', '2022-07-08 00:29:56'),
       (256, 2, NULL, '颜色', '魔幻青', 1, 'http://a.youlai.tech:9000/default/8815c9a46fcc4b1ea952623406750da5.jpg',
        '2022-03-11 14:39:21', '2022-07-08 00:29:56'),
       (257, 2, NULL, '颜色', '日蚀灰', 1, 'http://a.youlai.tech:9000/default/3210cd1ffb6c4346b743a10855d3cb37.jpg',
        '2022-03-11 14:39:21', '2022-07-08 00:29:56'),
       (258, 2, NULL, '规格', 'RTX3060/i7-12700H/165Hz 2.5K屏', 1, NULL, '2022-03-11 14:39:21', '2022-07-08 00:29:56'),
       (259, 2, NULL, '规格', 'RTX3050tTi/12代i5/144Hz高色域屏', 1, NULL, '2022-03-11 14:39:21', '2022-07-08 00:29:56'),
       (838, 3, NULL, '内存', '16g 32g', 2, NULL, '2022-07-07 00:22:13', '2022-07-08 00:29:41'),
       (839, 3, NULL, '重量', '1.5kg(含)-2kg(不含)', 2, NULL, '2022-07-07 00:22:13', '2022-07-08 00:29:41'),
       (840, 3, NULL, '显卡类型', '核芯显卡', 2, NULL, '2022-07-07 00:22:13', '2022-07-08 00:29:41'),
       (841, 3, NULL, '内存容量', '16g', 1, NULL, '2022-07-07 00:22:13', '2022-07-08 00:29:41'),
       (842, 3, NULL, '内存容量', '32g', 1, NULL, '2022-07-07 00:22:13', '2022-07-08 00:29:41'),
       (843, 3, NULL, '硬盘容量', '512g', 1, NULL, '2022-07-07 00:22:13', '2022-07-08 00:29:41'),
       (844, 3, NULL, '硬盘容量', '1t', 1, NULL, '2022-07-07 00:22:13', '2022-07-08 00:29:41'),
       (845, 3, NULL, '套餐类型', '【2022款】锐龙六核R5-6600U/核芯显卡/100%sRGB高色域', 1, NULL, '2022-07-07 00:22:13',
        '2022-07-08 00:29:41'),
       (846, 3, NULL, '套餐类型', '【2022款】锐龙八核R7-6800U/核芯显卡/100%sRGB高色域', 1, NULL, '2022-07-07 00:22:13',
        '2022-07-08 00:29:41');
/*!40000 ALTER TABLE `pms_spu_attribute`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `retail_category`
--

DROP TABLE IF EXISTS `retail_category`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `retail_category`
(
    `id`          bigint                                  NOT NULL AUTO_INCREMENT COMMENT 'カテゴリID',
    `name`        varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'カテゴリ名',
    `create_time` datetime   DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    `update_time` datetime   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
    `create_by`   bigint     DEFAULT NULL COMMENT '作成者',
    `update_by`   bigint     DEFAULT NULL COMMENT '更新者',
    `is_deleted`  tinyint(1) DEFAULT '0' COMMENT '削除フラグ',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 6
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='カテゴリマスタ';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `retail_category`
--

LOCK TABLES `retail_category` WRITE;
/*!40000 ALTER TABLE `retail_category`
    DISABLE KEYS */;
INSERT INTO `retail_category`
VALUES (1, '飲料', '2025-04-30 15:29:36', '2025-04-30 15:29:36', NULL, NULL, 0),
       (2, '食品', '2025-04-30 15:29:36', '2025-04-30 15:29:36', NULL, NULL, 0),
       (3, '日用品', '2025-04-30 15:29:36', '2025-04-30 15:29:36', NULL, NULL, 0),
       (4, '雑貨', '2025-04-30 15:29:36', '2025-04-30 15:29:36', NULL, NULL, 0),
       (5, 'その他', '2025-04-30 15:29:36', '2025-04-30 15:29:36', NULL, NULL, 0);
/*!40000 ALTER TABLE `retail_category`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `retail_product`
--

DROP TABLE IF EXISTS `retail_product`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `retail_product`
(
    `id`            bigint                                  NOT NULL AUTO_INCREMENT COMMENT '商品ID',
    `name`          varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名',
    `code`          varchar(50) COLLATE utf8mb4_unicode_ci  NOT NULL COMMENT '商品コード',
    `price`         decimal(10, 2)                          NOT NULL COMMENT '価格',
    `stock`         int                                     NOT NULL COMMENT '在庫数',
    `description`   varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商品説明',
    `category_id`   bigint                                  NOT NULL COMMENT 'カテゴリID',
    `category_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'カテゴリ名',
    `sales`         int                                     DEFAULT '0' COMMENT '販売数',
    `image_url`     varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商品画像URL',
    `expiry_date`   varchar(20) COLLATE utf8mb4_unicode_ci  DEFAULT NULL COMMENT '賞味期限',
    `create_time`   datetime                                DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    `update_time`   datetime                                DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
    `create_by`     bigint                                  DEFAULT NULL COMMENT '作成者',
    `update_by`     bigint                                  DEFAULT NULL COMMENT '更新者',
    `is_deleted`    tinyint(1)                              DEFAULT '0' COMMENT '削除フラグ',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 23
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='商品マスタ';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `retail_product`
--

LOCK TABLES `retail_product` WRITE;
/*!40000 ALTER TABLE `retail_product`
    DISABLE KEYS */;
INSERT INTO `retail_product`
VALUES (1, 'プレミアムコーヒー', 'P0001', 980.00, 100, '高品質なコーヒー豆を使用したプレミアムコーヒー', 1, '飲料', 50,
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop', '2024-12-31',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (2, '石鹸', 'P0002', 280.00, 200, '肌に優しい天然成分配合の石鹸', 2, '日用品', 30,
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200&h=200&fit=crop', '2025-06-30',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (3, 'シャンプー', 'P0003', 680.00, 150, '髪の毛に潤いを与える高級シャンプー', 2, '日用品', 20,
        'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=200&h=200&fit=crop', '2025-03-31',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (4, '緑茶', 'P0004', 380.00, 150, '香り高い日本の緑茶です。', 2, '飲料', 30,
        'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=200&h=200&fit=crop', '2024-11-30',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (5, 'オーガニックティー', 'P0005', 780.00, 50, '有機栽培された茶葉を使用したオーガニックティー', 1, '飲料', 75,
        'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop', '2025-06-30',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (6, '天然水', 'P0006', 120.00, 200, '天然のミネラルを豊富に含む天然水', 2, '食品', 250,
        'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=200&h=200&fit=crop', '2025-03-31',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (7, 'チョコレート', 'P0007', 280.00, 150, 'カカオ70%の高品質チョコレート', 3, '食品', 180,
        'https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=200&h=200&fit=crop', '2024-12-31',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (8, 'クッキー', 'P0008', 380.00, 80, 'バターの風味が豊かなクッキー', 3, '食品', 90,
        'https://images.unsplash.com/photo-1558964122-2e32e1612f2d?w=200&h=200&fit=crop', '2024-09-30',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (9, '紅茶', 'P0009', 680.00, 120, '芳醇な香りのセイロン紅茶', 1, '飲料', 150,
        'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop', '2025-06-30',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (10, 'ポテトチップス', 'P0010', 180.00, 200, 'サクサク食感のポテトチップス', 2, '食品', 90,
        'https://images.unsplash.com/photo-1565402170291-8491f14678db?w=200&h=200&fit=crop', '2025-03-31',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (11, 'キャンディー', 'P0011', 150.00, 300, 'フルーツ味のキャンディー', 2, '食品', 365,
        'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=200&h=200&fit=crop', '2025-06-30',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (12, 'ハンドソープ', 'P0012', 380.00, 150, '保湿成分配合のハンドソープ', 3, '日用品', 180,
        'https://images.unsplash.com/photo-1606813907290-d86a9c56a3b4?w=200&h=200&fit=crop', '2025-06-30',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (13, '歯ブラシ', 'P0013', 320.00, 200, '使いやすい柔らかめの歯ブラシです。', 3, '日用品', 60,
        'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200&h=200&fit=crop', '2026-12-31',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (14, 'ノート', 'P0014', 280.00, 300, '書きやすい上質な紙のノートです。', 4, '雑貨', 100,
        'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=200&h=200&fit=crop', '2026-12-31',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (15, 'ハーブティー', 'P0015', 580.00, 90, 'リラックス効果のあるハーブティー', 1, '飲料', 180,
        'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop', '2025-12-31',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (16, 'スポンジ', 'P0016', 280.00, 200, 'キッチン用スポンジ', 3, '日用品', 365,
        'https://images.unsplash.com/photo-1606813907290-d86a9c56a3b4?w=200&h=200&fit=crop', '2025-06-30',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (17, '収納ボックス', 'P0017', 1280.00, 50, 'スタッキング可能な収納ボックス', 4, '日用品', 1825,
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop', '2025-12-31',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (18, 'フォトフレーム', 'P0018', 980.00, 80, '木製フォトフレーム', 4, '日用品', 1825,
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=200&fit=crop', '2025-06-30',
        '2025-04-28 20:00:53', '2025-04-28 20:00:53', NULL, NULL, 0),
       (19, 'Updated Test Product', 'TP001', 199.99, 100, 'Test Description', 1, 'Test Category', 0, NULL, NULL,
        '2025-04-30 10:20:03', '2025-04-30 12:32:15', NULL, NULL, 0),
       (21, 'Test Product', 'TP001', 99.99, 100, 'Test Description', 1, 'Test Category', 0, NULL, NULL,
        '2025-04-30 12:32:15', '2025-04-30 12:32:15', NULL, NULL, 0),
       (22, 'Test Product', 'TP001', 99.99, 100, 'Test Description', 1, 'Test Category', 0, NULL, NULL,
        '2025-04-30 12:33:18', '2025-04-30 12:33:18', NULL, NULL, 0);
/*!40000 ALTER TABLE `retail_product`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_config`
--

DROP TABLE IF EXISTS `sys_config`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_config`
(
    `id`           bigint                                  NOT NULL AUTO_INCREMENT,
    `config_name`  varchar(50) COLLATE utf8mb4_unicode_ci  NOT NULL COMMENT '配置名称',
    `config_key`   varchar(50) COLLATE utf8mb4_unicode_ci  NOT NULL COMMENT '配置key',
    `config_value` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置值',
    `remark`       varchar(255) COLLATE utf8mb4_unicode_ci          DEFAULT NULL COMMENT '备注',
    `create_time`  datetime                                         DEFAULT NULL COMMENT '创建时间',
    `create_by`    bigint                                           DEFAULT NULL COMMENT '创建人ID',
    `update_time`  datetime                                         DEFAULT NULL COMMENT '更新时间',
    `update_by`    bigint                                           DEFAULT NULL COMMENT '更新人ID',
    `is_deleted`   tinyint                                 NOT NULL DEFAULT '0' COMMENT '逻辑删除标识(0-未删除 1-已删除)',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 2
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT ='系统配置表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_config`
--

LOCK TABLES `sys_config` WRITE;
/*!40000 ALTER TABLE `sys_config`
    DISABLE KEYS */;
INSERT INTO `sys_config`
VALUES (1, '系统限流QPS', 'IP_QPS_THRESHOLD_LIMIT', '10', '单个IP请求的最大每秒查询数（QPS）阈值Key',
        '2025-03-03 21:04:42', 1, NULL, NULL, 0);
/*!40000 ALTER TABLE `sys_config`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_dept`
--

DROP TABLE IF EXISTS `sys_dept`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_dept`
(
    `id`          bigint       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name`        varchar(100) NOT NULL COMMENT '部门名称',
    `code`        varchar(100) NOT NULL COMMENT '部门编号',
    `parent_id`   bigint   DEFAULT '0' COMMENT '父节点id',
    `tree_path`   varchar(255) NOT NULL COMMENT '父节点id路径',
    `sort`        smallint DEFAULT '0' COMMENT '显示顺序',
    `status`      tinyint  DEFAULT '1' COMMENT '状态(1-正常 0-禁用)',
    `create_by`   bigint   DEFAULT NULL COMMENT '创建人ID',
    `create_time` datetime DEFAULT NULL COMMENT '创建时间',
    `update_by`   bigint   DEFAULT NULL COMMENT '修改人ID',
    `update_time` datetime DEFAULT NULL COMMENT '更新时间',
    `is_deleted`  tinyint  DEFAULT '0' COMMENT '逻辑删除标识(1-已删除 0-未删除)',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_code` (`code`) USING BTREE COMMENT '部门编号唯一索引'
) ENGINE = InnoDB
  AUTO_INCREMENT = 4
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='部门表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_dept`
--

LOCK TABLES `sys_dept` WRITE;
/*!40000 ALTER TABLE `sys_dept`
    DISABLE KEYS */;
INSERT INTO `sys_dept`
VALUES (1, '有来技术', 'YOULAI', 0, '0', 1, 1, 1, NULL, 1, '2025-03-03 21:04:42', 0),
       (2, '研发部门', 'RD001', 1, '0,1', 1, 1, 2, NULL, 2, '2025-03-03 21:04:42', 0),
       (3, '测试部门', 'QA001', 1, '0,1', 1, 1, 2, NULL, 2, '2025-03-03 21:04:42', 0);
/*!40000 ALTER TABLE `sys_dept`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_dict`
--

DROP TABLE IF EXISTS `sys_dict`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_dict`
(
    `id`          bigint NOT NULL AUTO_INCREMENT COMMENT '主键 ',
    `dict_code`   varchar(50)  DEFAULT NULL COMMENT '类型编码',
    `name`        varchar(50)  DEFAULT NULL COMMENT '类型名称',
    `status`      tinyint(1)   DEFAULT '0' COMMENT '状态(0:正常;1:禁用)',
    `remark`      varchar(255) DEFAULT NULL COMMENT '备注',
    `create_time` datetime     DEFAULT NULL COMMENT '创建时间',
    `create_by`   bigint       DEFAULT NULL COMMENT '创建人ID',
    `update_time` datetime     DEFAULT NULL COMMENT '更新时间',
    `update_by`   bigint       DEFAULT NULL COMMENT '修改人ID',
    `is_deleted`  tinyint      DEFAULT '0' COMMENT '是否删除(1-删除，0-未删除)',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_dict_code` (`dict_code`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 5
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='字典表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_dict`
--

LOCK TABLES `sys_dict` WRITE;
/*!40000 ALTER TABLE `sys_dict`
    DISABLE KEYS */;
INSERT INTO `sys_dict`
VALUES (1, 'gender', '性别', 1, NULL, '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1, 0),
       (2, 'notice_type', '通知类型', 1, NULL, '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1, 0),
       (3, 'notice_level', '通知级别', 1, NULL, '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1, 0),
       (4, 'retail_category', '商品カテゴリ', 1, 'retail', '2025-05-01 09:26:01', NULL, '2025-05-01 09:26:01', NULL, 0);
/*!40000 ALTER TABLE `sys_dict`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_dict_data`
--

DROP TABLE IF EXISTS `sys_dict_data`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_dict_data`
(
    `id`          bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
    `dict_code`   varchar(50)  DEFAULT NULL COMMENT '关联字典编码，与sys_dict表中的dict_code对应',
    `value`       varchar(50)  DEFAULT NULL COMMENT '字典项值',
    `label`       varchar(100) DEFAULT NULL COMMENT '字典项标签',
    `tag_type`    varchar(50)  DEFAULT NULL COMMENT '标签类型，用于前端样式展示（如success、warning等）',
    `status`      tinyint      DEFAULT '0' COMMENT '状态（1-正常，0-禁用）',
    `sort`        int          DEFAULT '0' COMMENT '排序',
    `remark`      varchar(255) DEFAULT NULL COMMENT '备注',
    `create_time` datetime     DEFAULT NULL COMMENT '创建时间',
    `create_by`   bigint       DEFAULT NULL COMMENT '创建人ID',
    `update_time` datetime     DEFAULT NULL COMMENT '更新时间',
    `update_by`   bigint       DEFAULT NULL COMMENT '修改人ID',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 13
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='字典数据表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_dict_data`
--

LOCK TABLES `sys_dict_data` WRITE;
/*!40000 ALTER TABLE `sys_dict_data`
    DISABLE KEYS */;
INSERT INTO `sys_dict_data`
VALUES (1, 'gender', '1', '男', 'primary', 1, 1, NULL, '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1),
       (2, 'gender', '2', '女', 'danger', 1, 2, NULL, '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1),
       (3, 'gender', '0', '保密', 'info', 1, 3, NULL, '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1),
       (4, 'notice_type', '1', '系统升级', 'success', 1, 1, '', '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1),
       (5, 'notice_type', '2', '系统维护', 'primary', 1, 2, '', '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1),
       (6, 'notice_type', '3', '安全警告', 'danger', 1, 3, '', '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1),
       (7, 'notice_type', '4', '假期通知', 'success', 1, 4, '', '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1),
       (8, 'notice_type', '5', '公司新闻', 'primary', 1, 5, '', '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1),
       (9, 'notice_type', '99', '其他', 'info', 1, 99, '', '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1),
       (10, 'notice_level', 'L', '低', 'info', 1, 1, '', '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1),
       (11, 'notice_level', 'M', '中', 'warning', 1, 2, '', '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1),
       (12, 'notice_level', 'H', '高', 'danger', 1, 3, '', '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 1);
/*!40000 ALTER TABLE `sys_dict_data`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_log`
--

DROP TABLE IF EXISTS `sys_log`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_log`
(
    `id`               bigint       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `module`           varchar(50)  NOT NULL COMMENT '日志模块',
    `request_method`   varchar(64)  NOT NULL COMMENT '请求方式',
    `request_params`   text COMMENT '请求参数(批量请求参数可能会超过text)',
    `response_content` mediumtext COMMENT '返回参数',
    `content`          varchar(255) NOT NULL COMMENT '日志内容',
    `request_uri`      varchar(255) DEFAULT NULL COMMENT '请求路径',
    `method`           varchar(255) DEFAULT NULL COMMENT '方法名',
    `ip`               varchar(45)  DEFAULT NULL COMMENT 'IP地址',
    `province`         varchar(100) DEFAULT NULL COMMENT '省份',
    `city`             varchar(100) DEFAULT NULL COMMENT '城市',
    `execution_time`   bigint       DEFAULT NULL COMMENT '执行时间(ms)',
    `browser`          varchar(100) DEFAULT NULL COMMENT '浏览器',
    `browser_version`  varchar(100) DEFAULT NULL COMMENT '浏览器版本',
    `os`               varchar(100) DEFAULT NULL COMMENT '终端系统',
    `create_by`        bigint       DEFAULT NULL COMMENT '创建人ID',
    `create_time`      datetime     DEFAULT NULL COMMENT '创建时间',
    `is_deleted`       tinyint      DEFAULT '0' COMMENT '逻辑删除标识(1-已删除 0-未删除)',
    PRIMARY KEY (`id`) USING BTREE,
    KEY `idx_create_time` (`create_time`)
) ENGINE = MyISAM
  AUTO_INCREMENT = 227
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='系统日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_log`
--

LOCK TABLES `sys_log` WRITE;
/*!40000 ALTER TABLE `sys_log`
    DISABLE KEYS */;
INSERT INTO `sys_log`
VALUES (1, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '198.19.249.3', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-04 22:07:37', 0),
       (2, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '198.19.249.3', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-04 22:07:37', 0),
       (3, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '198.19.249.3', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', 2, '2025-03-04 22:08:09', 0),
       (4, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '198.19.249.3', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-04 22:21:33', 0),
       (5, 'OTHER', 'POST',
        '{\"tableName\":\"pms_spu\",\"businessName\":\"商品\",\"moduleName\":\"system\",\"packageName\":\"com.youlai.boot\",\"entityName\":\"PmsSpu\",\"author\":\"youlaitech\",\"fieldConfigs\":[{\"columnName\":\"id\",\"columnType\":\"bigint\",\"fieldName\":\"id\",\"fieldSort\":1,\"fieldType\":\"Long\",\"fieldComment\":\"主键\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":1,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"name\",\"columnType\":\"varchar\",\"fieldName\":\"name\",\"fieldSort\":2,\"fieldType\":\"String\",\"fieldComment\":\"商品名称\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":1,\"maxLength\":64,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"category_id\",\"columnType\":\"bigint\",\"fieldName\":\"categoryId\",\"fieldSort\":3,\"fieldType\":\"Long\",\"fieldComment\":\"商品类型ID\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":1,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"brand_id\",\"columnType\":\"bigint\",\"fieldName\":\"brandId\",\"fieldSort\":4,\"fieldType\":\"Long\",\"fieldComment\":\"商品品牌ID\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":0,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"origin_price\",\"columnType\":\"bigint\",\"fieldName\":\"originPrice\",\"fieldSort\":5,\"fieldType\":\"Long\",\"fieldComment\":\"原价【起】\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":1,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"price\",\"columnType\":\"bigint\",\"fieldName\":\"price\",\"fieldSort\":6,\"fieldType\":\"Long\",\"fieldComment\":\"现价【起】\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":1,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"sales\",\"columnType\":\"int\",\"fieldName\":\"sales\",\"fieldSort\":7,\"fieldType\":\"Integer\",\"fieldComment\":\"销量\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":0,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"pic_url\",\"columnType\":\"varchar\",\"fieldName\":\"picUrl\",\"fieldSort\":8,\"fieldType\":\"String\",\"fieldComment\":\"商品主图\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":0,\"maxLength\":255,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"album\",\"columnType\":\"json\",\"fieldName\":\"album\",\"fieldSort\":9,\"fieldType\":\"String\",\"fieldComment\":\"商品图册\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":0,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"unit\",\"columnType\":\"varchar\",\"fieldName\":\"unit\",\"fieldSort\":10,\"fieldType\":\"String\",\"fieldComment\":\"单位\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":0,\"maxLength\":16,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"description\",\"columnType\":\"varchar\",\"fieldName\":\"description\",\"fieldSort\":11,\"fieldType\":\"String\",\"fieldComment\":\"商品简介\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":0,\"maxLength\":255,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"detail\",\"columnType\":\"text\",\"fieldName\":\"detail\",\"fieldSort\":12,\"fieldType\":\"String\",\"fieldComment\":\"商品详情\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":0,\"maxLength\":65535,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"status\",\"columnType\":\"tinyint\",\"fieldName\":\"status\",\"fieldSort\":13,\"fieldType\":\"Integer\",\"fieldComment\":\"商品状态(0:下架 1:上架)\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":0,\"formType\":\"INPUT\",\"queryType\":\"EQ\"},{\"columnName\":\"create_time\",\"columnType\":\"datetime\",\"fieldName\":\"createTime\",\"fieldSort\":14,\"fieldType\":\"LocalDateTime\",\"fieldComment\":\"创建时间\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":0,\"formType\":\"DATE_TIME\",\"queryType\":\"EQ\"},{\"columnName\":\"update_time\",\"columnType\":\"datetime\",\"fieldName\":\"updateTime\",\"fieldSort\":15,\"fieldType\":\"LocalDateTime\",\"fieldComment\":\"更新时间\",\"isShowInList\":1,\"isShowInForm\":1,\"isRequired\":0,\"formType\":\"DATE_TIME\",\"queryType\":\"EQ\"}],\"backendAppName\":\"youlai-boot\",\"frontendAppName\":\"vue3-element-admin\"}',
        NULL, '生成代码', '/api/v1/codegen/pms_spu/config', NULL, '192.168.0.72', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', 2, '2025-03-04 22:51:20', 0),
       (6, 'OTHER', 'GET', 'pms_spu', NULL, '预览生成代码', '/api/v1/codegen/pms_spu/preview', NULL, '192.168.0.72',
        '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-04 22:51:20', 0),
       (7, 'OTHER', 'GET', 'pms_spu', NULL, '下载代码', '/api/v1/codegen/pms_spu/download', NULL, '192.168.0.72', '0',
        '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-04 22:51:40', 0),
       (8, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 11:07:54', 0),
       (9, 'ROLE', 'GET', '{\"pageNum\":2,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 11:12:09', 0),
       (10, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 11:12:11', 0),
       (11, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', 2, '2025-03-05 11:12:14', 0),
       (12, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 11:12:20', 0),
       (13, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', 2, '2025-03-05 11:12:22', 0),
       (14, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 11:46:33', 0),
       (15, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 11:46:33', 0),
       (16, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 12:25:52', 0),
       (17, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', 2, '2025-03-05 12:25:55', 0),
       (18, 'LOGIN', 'DELETE', '{}', NULL, '注销', '/api/v1/auth/logout', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', NULL, '2025-03-05 12:52:00', 0),
       (19, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 12:52:07', 0),
       (20, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 12:52:07', 0),
       (21, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 12:53:53', 0),
       (22, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 12:54:00', 0),
       (23, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 13:05:52', 0),
       (24, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 13:05:52', 0),
       (25, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', 2, '2025-03-05 13:06:13', 0),
       (26, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 13:39:06', 0),
       (27, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 13:39:07', 0),
       (28, 'SETTING', 'GET', '{\"keywords\":\"\",\"pageNum\":1,\"pageSize\":10}', NULL, '系统配置分页列表',
        '/api/v1/config/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2,
        '2025-03-05 13:39:17', 0),
       (29, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 14:18:52', 0),
       (30, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 14:18:52', 0),
       (31, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 14:18:55', 0),
       (32, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 14:18:55', 0),
       (33, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 14:21:38', 0),
       (34, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 14:21:38', 0),
       (35, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 14:21:47', 0),
       (36, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-05 14:21:47', 0),
       (37, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-08 19:00:18', 0),
       (38, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-08 19:00:18', 0),
       (39, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-08 19:00:45', 0),
       (40, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-08 19:00:45', 0),
       (41, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-08 20:13:16', 0),
       (42, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-08 20:13:16', 0),
       (43, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-08 20:14:25', 0),
       (44, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-08 20:14:25', 0),
       (45, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-08 20:31:25', 0),
       (46, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-08 20:31:25', 0),
       (47, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-08 20:32:10', 0),
       (48, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-08 20:32:10', 0),
       (49, 'SETTING', 'GET', '{\"keywords\":\"\",\"pageNum\":1,\"pageSize\":10}', NULL, '系统配置分页列表',
        '/api/v1/config/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2,
        '2025-03-08 20:37:57', 0),
       (50, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-09 06:16:20', 0),
       (51, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-09 06:16:21', 0),
       (52, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-09 06:28:39', 0),
       (53, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-09 06:28:39', 0),
       (54, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', 2, '2025-03-09 06:28:41', 0),
       (55, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', 2, '2025-03-09 06:28:44', 0),
       (56, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', 2, '2025-03-09 08:06:01', 0),
       (57, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-12 08:32:25', 0),
       (58, 'LOGIN', 'DELETE', '{}', NULL, '注销', '/api/v1/auth/logout', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', NULL, '2025-03-13 08:55:10', 0),
       (59, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-13 08:55:14', 0),
       (60, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-13 08:55:14', 0),
       (61, 'LOGIN', 'DELETE', '{}', NULL, '注销', '/api/v1/auth/logout', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', NULL, '2025-03-13 09:02:36', 0),
       (62, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-13 09:02:43', 0),
       (63, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-13 09:02:43', 0),
       (64, 'LOGIN', 'DELETE', '{}', NULL, '注销', '/api/v1/auth/logout', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '133.0.0.0', 'OSX', NULL, '2025-03-13 09:08:43', 0),
       (65, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-13 09:08:46', 0),
       (66, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-13 09:08:46', 0),
       (67, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-13 09:09:44', 0),
       (68, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-13 09:09:44', 0),
       (69, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-17 20:53:14', 0),
       (70, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-17 21:22:07', 0),
       (71, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '133.0.0.0', 'OSX', 2, '2025-03-17 21:22:07', 0),
       (72, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-17 21:24:19', 0),
       (73, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-17 21:24:19', 0),
       (74, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-17 21:24:26', 0),
       (75, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-20 11:49:56', 0),
       (76, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-20 11:49:56', 0),
       (77, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-03-20 12:25:57', 0),
       (78, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-20 12:26:24', 0),
       (79, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-20 12:33:47', 0),
       (80, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-21 11:53:21', 0),
       (81, 'USER', 'GET', '{}', NULL, '用户表单数据', '/api/v1/users/1/form', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-21 11:53:30', 0),
       (82, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-21 11:53:36', 0),
       (83, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-21 12:15:01', 0),
       (84, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-21 12:15:01', 0),
       (85, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-03-21 12:49:39', 0),
       (86, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":2,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-03-21 14:35:47', 0),
       (87, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-21 15:05:58', 0),
       (88, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-21 15:06:05', 0),
       (89, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-03-21 15:06:31', 0),
       (90, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-21 15:06:34', 0),
       (91, 'DICT', 'GET', '{\"dictCode\":\"gender\",\"pageNum\":1,\"pageSize\":10}', NULL, '字典数据分页列表',
        '/api/v1/dict-data/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2,
        '2025-03-21 15:06:37', 0),
       (92, 'SETTING', 'GET', '{\"keywords\":\"\",\"pageNum\":1,\"pageSize\":10}', NULL, '系统配置分页列表',
        '/api/v1/config/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2,
        '2025-03-21 15:07:02', 0),
       (93, 'LOGIN', 'DELETE', '{}', NULL, '注销', '/api/v1/auth/logout', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', NULL, '2025-03-21 17:29:50', 0),
       (94, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-21 17:29:53', 0),
       (95, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-21 17:29:53', 0),
       (96, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-03-22 20:33:14', 0),
       (97, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-22 23:05:44', 0),
       (98, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-22 23:10:14', 0),
       (99, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-03-22 23:11:05', 0),
       (100, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-03-23 00:26:02', 0),
       (101, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-23 15:47:45', 0),
       (102, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-23 15:47:45', 0),
       (103, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '134.0.0.0', 'OSX', 2, '2025-03-23 21:19:59', 0),
       (104, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-03-23 21:20:11', 0),
       (105, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:27:40', 0),
       (106, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:27:40', 0),
       (107, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-04-15 11:28:25', 0),
       (108, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '134.0.0.0', 'OSX', 2, '2025-04-15 11:28:25', 0),
       (109, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-04-15 11:28:31', 0),
       (110, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-04-15 11:28:33', 0),
       (111, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 11:32:56', 0),
       (112, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 11:33:42', 0),
       (113, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 11:33:43', 0),
       (114, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:33:46', 0),
       (115, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:34:49', 0),
       (116, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:34:52', 0),
       (117, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', NULL, NULL, 0, 'Chrome', '134.0.0.0',
        'OSX', 2, '2025-04-15 11:48:53', 0),
       (118, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:48:53', 0),
       (119, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-04-15 11:49:20', 0),
       (120, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:49:20', 0),
       (121, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', NULL, NULL, 0, 'Chrome', '134.0.0.0',
        'OSX', 2, '2025-04-15 11:49:54', 0),
       (122, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:49:54', 0),
       (123, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:52:07', 0),
       (124, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-04-15 11:55:08', 0),
       (125, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:55:08', 0),
       (126, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:55:23', 0),
       (127, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:57:02', 0),
       (128, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-04-15 11:57:03', 0),
       (129, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-04-15 11:58:54', 0),
       (130, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:58:54', 0),
       (131, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', NULL, NULL, 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 11:59:05', 0),
       (132, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', NULL, NULL, 0, 'Chrome', '134.0.0.0',
        'OSX', 2, '2025-04-15 11:59:05', 0),
       (133, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-04-15 12:13:45', 0),
       (134, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 12:14:15', 0),
       (135, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 12:14:19', 0),
       (136, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 12:15:37', 0),
       (137, 'USER', 'GET', '{}', NULL, '用户表单数据', '/api/v1/users/1/form', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 12:15:57', 0),
       (138, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 12:16:09', 0),
       (139, 'SETTING', 'GET', '{\"keywords\":\"\",\"pageNum\":1,\"pageSize\":10}', NULL, '系统配置分页列表',
        '/api/v1/config/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2,
        '2025-04-15 12:16:16', 0),
       (140, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 12:24:24', 0),
       (141, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 13:34:15', 0),
       (142, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 13:34:16', 0),
       (143, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 13:38:37', 0),
       (144, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 13:38:42', 0),
       (145, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 13:38:45', 0),
       (146, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-04-15 14:03:57', 0),
       (147, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '134.0.0.0', 'OSX', 2, '2025-04-15 14:42:43', 0),
       (148, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 15:02:52', 0),
       (149, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 15:02:52', 0),
       (150, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 15:23:40', 0),
       (151, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 15:23:41', 0),
       (152, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 15:24:37', 0),
       (153, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 15:57:30', 0),
       (154, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 15:57:31', 0),
       (155, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 15:57:40', 0),
       (156, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 17:16:45', 0),
       (157, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 17:16:50', 0),
       (158, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 17:16:52', 0),
       (159, 'SETTING', 'GET', '{\"keywords\":\"\",\"pageNum\":1,\"pageSize\":10}', NULL, '系统配置分页列表',
        '/api/v1/config/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2,
        '2025-04-15 17:16:53', 0),
       (160, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 17:17:01', 0),
       (161, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 17:17:14', 0),
       (162, 'ROLE', 'GET', '{\"pageNum\":2,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 17:17:35', 0),
       (163, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 17:19:23', 0),
       (164, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 17:22:10', 0),
       (165, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 17:22:11', 0),
       (166, 'SETTING', 'GET', '{\"keywords\":\"\",\"pageNum\":1,\"pageSize\":10}', NULL, '系统配置分页列表',
        '/api/v1/config/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2,
        '2025-04-15 17:22:14', 0),
       (167, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 17:22:22', 0),
       (168, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 17:23:57', 0),
       (169, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":20}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 17:42:33', 0),
       (170, 'OTHER', 'GET', '{\"excludeTables\":[\"gen_config\",\"gen_field_config\"],\"pageNum\":1,\"pageSize\":10}',
        NULL, '代码生成分页列表', '/api/v1/codegen/table/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-04-15 17:43:07', 0),
       (171, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 17:43:10', 0),
       (172, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 17:43:12', 0),
       (173, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 20:00:30', 0),
       (174, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-15 20:00:30', 0),
       (175, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 10:00:37', 0),
       (176, 'USER', 'GET', '{\"deptId\":2,\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page',
        NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 10:00:49', 0),
       (177, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 10:08:27', 0),
       (178, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 10:08:28', 0),
       (179, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 10:45:39', 0),
       (180, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 12:47:18', 0),
       (181, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 16:27:34', 0),
       (182, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 17:19:03', 0),
       (183, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 18:25:46', 0),
       (184, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 18:25:46', 0),
       (185, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 19:06:59', 0),
       (186, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 19:06:59', 0),
       (187, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 20:07:08', 0),
       (188, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 20:07:08', 0),
       (189, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 20:19:54', 0),
       (190, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-16 20:19:54', 0),
       (191, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-17 08:22:10', 0),
       (192, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-17 08:22:10', 0),
       (193, 'SETTING', 'GET', '{\"keywords\":\"\",\"pageNum\":1,\"pageSize\":10}', NULL, '系统配置分页列表',
        '/api/v1/config/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2,
        '2025-04-17 09:22:35', 0),
       (194, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-29 14:13:21', 0),
       (195, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-29 14:15:57', 0),
       (196, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '192.168.1.187', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-29 21:05:37', 0),
       (197, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '192.168.1.187', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-29 21:05:59', 0),
       (198, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-29 21:41:29', 0),
       (199, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-29 21:41:45', 0),
       (200, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-30 10:05:02', 0),
       (201, 'LOGIN', 'DELETE', '{}', NULL, '注销', '/api/v1/auth/logout', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', NULL, '2025-04-30 10:18:11', 0),
       (202, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-30 10:18:42', 0),
       (203, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-30 10:18:42', 0),
       (204, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-30 10:18:43', 0),
       (205, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-30 12:07:29', 0),
       (206, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-30 12:29:58', 0),
       (207, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-30 12:35:44', 0),
       (208, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-30 13:07:28', 0),
       (209, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-04-30 13:07:28', 0),
       (210, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-05-01 09:23:13', 0),
       (211, 'DICT', 'GET', '{\"dictCode\":\"gender\",\"pageNum\":1,\"pageSize\":10}', NULL, '字典数据分页列表',
        '/api/v1/dict-data/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2,
        '2025-05-01 09:23:15', 0),
       (212, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-05-01 09:26:01', 0),
       (213, 'LOGIN', 'POST', 'admin 123456', NULL, '登录', '/api/v1/auth/login', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-05-01 09:37:11', 0),
       (214, 'USER', 'GET', '', NULL, '获取当前登录用户信息', '/api/v1/users/me', NULL, '127.0.0.1', '0', '内网IP', 0,
        'Chrome', '135.0.0.0', 'OSX', 2, '2025-05-01 09:37:11', 0),
       (215, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-05-01 09:37:19', 0),
       (216, 'DICT', 'GET', '{\"dictCode\":\"retail_category\",\"pageNum\":1,\"pageSize\":10}', NULL,
        '字典数据分页列表', '/api/v1/dict-data/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX',
        2, '2025-05-01 09:37:22', 0),
       (217, 'DICT', 'GET', '{\"dictCode\":\"retail_category\",\"pageNum\":1,\"pageSize\":10}', NULL,
        '字典数据分页列表', '/api/v1/dict-data/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX',
        2, '2025-05-01 09:38:20', 0),
       (218, 'DICT', 'GET', '{\"dictCode\":\"notice_level\",\"pageNum\":1,\"pageSize\":10}', NULL, '字典数据分页列表',
        '/api/v1/dict-data/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2,
        '2025-05-01 09:39:55', 0),
       (219, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-05-01 09:39:58', 0),
       (220, 'DICT', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '字典分页列表', '/api/v1/dict/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-05-01 09:40:13', 0),
       (221, 'DICT', 'GET', '{\"dictCode\":\"notice_level\",\"pageNum\":1,\"pageSize\":10}', NULL, '字典数据分页列表',
        '/api/v1/dict-data/page', NULL, '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2,
        '2025-05-01 09:40:15', 0),
       (222, 'USER', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '用户分页列表', '/api/v1/users/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-05-01 11:55:37', 0),
       (223, 'ROLE', 'GET', '{\"pageNum\":1,\"pageSize\":10}', NULL, '角色分页列表', '/api/v1/roles/page', NULL,
        '127.0.0.1', '0', '内网IP', 0, 'Chrome', '135.0.0.0', 'OSX', 2, '2025-05-01 11:55:43', 0),
       (224, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 8, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-05-01 12:13:28', 0),
       (225, 'MENU', 'GET', '{}', NULL, '菜单列表', '/api/v1/menus', NULL, '127.0.0.1', '0', '内网IP', 38, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-05-01 12:13:39', 0),
       (226, 'DEPT', 'GET', '{}', NULL, '部门列表', '/api/v1/dept', NULL, '127.0.0.1', '0', '内网IP', 27, 'Chrome',
        '135.0.0.0', 'OSX', 2, '2025-05-01 12:14:57', 0);
/*!40000 ALTER TABLE `sys_log`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_menu`
--

DROP TABLE IF EXISTS `sys_menu`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_menu`
(
    `id`          bigint      NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `parent_id`   bigint      NOT NULL COMMENT '父菜单ID',
    `tree_path`   varchar(255) DEFAULT NULL COMMENT '父节点ID路径',
    `name`        varchar(64) NOT NULL COMMENT '菜单名称',
    `type`        tinyint     NOT NULL COMMENT '菜单类型（1-菜单 2-目录 3-外链 4-按钮）',
    `route_name`  varchar(255) DEFAULT NULL COMMENT '路由名称（Vue Router 中用于命名路由）',
    `route_path`  varchar(128) DEFAULT NULL COMMENT '路由路径（Vue Router 中定义的 URL 路径）',
    `component`   varchar(128) DEFAULT NULL COMMENT '组件路径（组件页面完整路径，相对于 src/views/，缺省后缀 .vue）',
    `perm`        varchar(128) DEFAULT NULL COMMENT '【按钮】权限标识',
    `always_show` tinyint      DEFAULT '0' COMMENT '【目录】只有一个子路由是否始终显示（1-是 0-否）',
    `keep_alive`  tinyint      DEFAULT '0' COMMENT '【菜单】是否开启页面缓存（1-是 0-否）',
    `visible`     tinyint(1)   DEFAULT '1' COMMENT '显示状态（1-显示 0-隐藏）',
    `sort`        int          DEFAULT '0' COMMENT '排序',
    `icon`        varchar(64)  DEFAULT NULL COMMENT '菜单图标',
    `redirect`    varchar(128) DEFAULT NULL COMMENT '跳转路径',
    `create_time` datetime     DEFAULT NULL COMMENT '创建时间',
    `update_time` datetime     DEFAULT NULL COMMENT '更新时间',
    `params`      varchar(255) DEFAULT NULL COMMENT '路由参数',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 147
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='菜单管理';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_menu`
--

LOCK TABLES `sys_menu` WRITE;
/*!40000 ALTER TABLE `sys_menu`
    DISABLE KEYS */;
INSERT INTO `sys_menu`
VALUES (1, 0, '0', '系统管理', 2, '', '/system', 'Layout', NULL, NULL, NULL, 1, 1, 'system', '/system/user',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (2, 1, '0,1', '用户管理', 1, 'User', 'user', 'system/user/index', NULL, NULL, 1, 1, 1, 'el-icon-User', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (3, 1, '0,1', '角色管理', 1, 'Role', 'role', 'system/role/index', NULL, NULL, 1, 1, 2, 'role', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (4, 1, '0,1', '菜单管理', 1, 'SysMenu', 'menu', 'system/menu/index', NULL, NULL, 1, 1, 3, 'menu', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (5, 1, '0,1', '部门管理', 1, 'Dept', 'dept', 'system/dept/index', NULL, NULL, 1, 1, 4, 'tree', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (6, 1, '0,1', '字典管理', 1, 'Dict', 'dict', 'system/dict/index', NULL, NULL, 1, 1, 5, 'dict', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (20, 0, '0', '多级菜单', 2, NULL, '/multi-level', 'Layout', NULL, 1, NULL, 1, 9, 'cascader', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (21, 20, '0,20', '菜单一级', 1, NULL, 'multi-level1', 'demo/multi-level/level1', NULL, 1, NULL, 1, 1, '', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (22, 21, '0,20,21', '菜单二级', 1, NULL, 'multi-level2', 'demo/multi-level/children/level2', NULL, 0, NULL, 1, 1,
        '', NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (23, 22, '0,20,21,22', '菜单三级-1', 1, NULL, 'multi-level3-1', 'demo/multi-level/children/children/level3-1',
        NULL, 0, 1, 1, 1, '', '', '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (24, 22, '0,20,21,22', '菜单三级-2', 1, NULL, 'multi-level3-2', 'demo/multi-level/children/children/level3-2',
        NULL, 0, 1, 1, 2, '', '', '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (26, 0, '0', '平台文档', 2, '', '/doc', 'Layout', NULL, NULL, NULL, 1, 8, 'document',
        'https://juejin.cn/post/7228990409909108793', '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (30, 26, '0,26', '平台文档(外链)', 3, NULL, 'https://juejin.cn/post/7228990409909108793', '', NULL, NULL, NULL,
        1, 2, 'link', '', '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (31, 2, '0,1,2', '用户新增', 4, NULL, '', NULL, 'sys:user:add', NULL, NULL, 1, 1, '', '', '2025-03-03 21:04:42',
        '2025-03-03 21:04:42', NULL),
       (32, 2, '0,1,2', '用户编辑', 4, NULL, '', NULL, 'sys:user:edit', NULL, NULL, 1, 2, '', '', '2025-03-03 21:04:42',
        '2025-03-03 21:04:42', NULL),
       (33, 2, '0,1,2', '用户删除', 4, NULL, '', NULL, 'sys:user:delete', NULL, NULL, 1, 3, '', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (36, 0, '0', '组件封装', 2, NULL, '/component', 'Layout', NULL, NULL, NULL, 1, 10, 'menu', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (37, 36, '0,36', '富文本编辑器', 1, NULL, 'wang-editor', 'demo/wang-editor', NULL, NULL, 1, 1, 2, '', '', NULL,
        NULL, NULL),
       (38, 36, '0,36', '图片上传', 1, NULL, 'upload', 'demo/upload', NULL, NULL, 1, 1, 3, '', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (39, 36, '0,36', '图标选择器', 1, NULL, 'icon-selector', 'demo/icon-selector', NULL, NULL, 1, 1, 4, '', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (40, 0, '0', '接口文档', 2, NULL, '/api', 'Layout', NULL, 1, NULL, 1, 7, 'api', '', '2025-03-03 21:04:42',
        '2025-03-03 21:04:42', NULL),
       (41, 40, '0,40', 'Apifox', 1, NULL, 'apifox', 'demo/api/apifox', NULL, NULL, 1, 1, 1, 'api', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (70, 3, '0,1,3', '角色新增', 4, NULL, '', NULL, 'sys:role:add', NULL, NULL, 1, 2, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (71, 3, '0,1,3', '角色编辑', 4, NULL, '', NULL, 'sys:role:edit', NULL, NULL, 1, 3, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (72, 3, '0,1,3', '角色删除', 4, NULL, '', NULL, 'sys:role:delete', NULL, NULL, 1, 4, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (73, 4, '0,1,4', '菜单新增', 4, NULL, '', NULL, 'sys:menu:add', NULL, NULL, 1, 1, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (74, 4, '0,1,4', '菜单编辑', 4, NULL, '', NULL, 'sys:menu:edit', NULL, NULL, 1, 3, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (75, 4, '0,1,4', '菜单删除', 4, NULL, '', NULL, 'sys:menu:delete', NULL, NULL, 1, 3, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (76, 5, '0,1,5', '部门新增', 4, NULL, '', NULL, 'sys:dept:add', NULL, NULL, 1, 1, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (77, 5, '0,1,5', '部门编辑', 4, NULL, '', NULL, 'sys:dept:edit', NULL, NULL, 1, 2, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (78, 5, '0,1,5', '部门删除', 4, NULL, '', NULL, 'sys:dept:delete', NULL, NULL, 1, 3, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (79, 6, '0,1,6', '字典新增', 4, NULL, '', NULL, 'sys:dict:add', NULL, NULL, 1, 1, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (81, 6, '0,1,6', '字典编辑', 4, NULL, '', NULL, 'sys:dict:edit', NULL, NULL, 1, 2, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (84, 6, '0,1,6', '字典删除', 4, NULL, '', NULL, 'sys:dict:delete', NULL, NULL, 1, 3, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (88, 2, '0,1,2', '重置密码', 4, NULL, '', NULL, 'sys:user:password:reset', NULL, NULL, 1, 4, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (89, 0, '0', '功能演示', 2, NULL, '/function', 'Layout', NULL, NULL, NULL, 1, 12, 'menu', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (90, 89, '0,89', 'Websocket', 1, NULL, '/function/websocket', 'demo/websocket', NULL, NULL, 1, 1, 3, '', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (91, 89, '0,89', '敬请期待...', 2, NULL, 'other/:id', 'demo/other', NULL, NULL, NULL, 1, 4, '', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (95, 36, '0,36', '字典组件', 1, NULL, 'dict-demo', 'demo/dictionary', NULL, NULL, 1, 1, 4, '', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (97, 89, '0,89', 'Icons', 1, NULL, 'icon-demo', 'demo/icons', NULL, NULL, 1, 1, 2, 'el-icon-Notification', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (102, 26, '0,26', 'document', 3, '', 'internal-doc', 'demo/internal-doc', NULL, NULL, NULL, 1, 1, 'document', '',
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (105, 2, '0,1,2', '用户查询', 4, NULL, '', NULL, 'sys:user:query', 0, 0, 1, 0, '', NULL, '2025-03-03 21:04:42',
        '2025-03-03 21:04:42', NULL),
       (106, 2, '0,1,2', '用户导入', 4, NULL, '', NULL, 'sys:user:import', NULL, NULL, 1, 5, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (107, 2, '0,1,2', '用户导出', 4, NULL, '', NULL, 'sys:user:export', NULL, NULL, 1, 6, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (108, 36, '0,36', '增删改查', 1, NULL, 'curd', 'demo/curd/index', NULL, NULL, 1, 1, 0, '', '', NULL, NULL, NULL),
       (109, 36, '0,36', '列表选择器', 1, NULL, 'table-select', 'demo/table-select/index', NULL, NULL, 1, 1, 1, '', '',
        NULL, NULL, NULL),
       (110, 0, '0', '路由参数', 2, NULL, '/route-param', 'Layout', NULL, 1, 1, 1, 11, 'el-icon-ElementPlus', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (111, 110, '0,110', '参数(type=1)', 1, NULL, 'route-param-type1', 'demo/route-param', NULL, 0, 1, 1, 1,
        'el-icon-Star', NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', '{\"type\": \"1\"}'),
       (112, 110, '0,110', '参数(type=2)', 1, NULL, 'route-param-type2', 'demo/route-param', NULL, 0, 1, 1, 2,
        'el-icon-StarFilled', NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', '{\"type\": \"2\"}'),
       (117, 1, '0,1', '系统日志', 1, 'Log', 'log', 'system/log/index', NULL, 0, 1, 1, 6, 'document', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (118, 0, '0', '系统工具', 2, NULL, '/codegen', 'Layout', NULL, 0, 1, 1, 2, 'menu', NULL, '2025-03-03 21:04:42',
        '2025-03-03 21:04:42', NULL),
       (119, 118, '0,118', '代码生成', 1, 'Codegen', 'codegen', 'codegen/index', NULL, 0, 1, 1, 1, 'code', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (120, 1, '0,1', '系统配置', 1, 'Config', 'config', 'system/config/index', NULL, 0, 1, 1, 7, 'setting', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (121, 120, '0,1,120', '系统配置查询', 4, NULL, '', NULL, 'sys:config:query', 0, 1, 1, 1, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (122, 120, '0,1,120', '系统配置新增', 4, NULL, '', NULL, 'sys:config:add', 0, 1, 1, 2, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (123, 120, '0,1,120', '系统配置修改', 4, NULL, '', NULL, 'sys:config:update', 0, 1, 1, 3, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (124, 120, '0,1,120', '系统配置删除', 4, NULL, '', NULL, 'sys:config:delete', 0, 1, 1, 4, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (125, 120, '0,1,120', '系统配置刷新', 4, NULL, '', NULL, 'sys:config:refresh', 0, 1, 1, 5, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (126, 1, '0,1', '通知公告', 1, 'Notice', 'notice', 'system/notice/index', NULL, NULL, NULL, 1, 9, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (127, 126, '0,1,126', '通知查询', 4, NULL, '', NULL, 'sys:notice:query', NULL, NULL, 1, 1, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (128, 126, '0,1,126', '通知新增', 4, NULL, '', NULL, 'sys:notice:add', NULL, NULL, 1, 2, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (129, 126, '0,1,126', '通知编辑', 4, NULL, '', NULL, 'sys:notice:edit', NULL, NULL, 1, 3, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (130, 126, '0,1,126', '通知删除', 4, NULL, '', NULL, 'sys:notice:delete', NULL, NULL, 1, 4, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (133, 126, '0,1,126', '通知发布', 4, NULL, '', NULL, 'sys:notice:publish', 0, 1, 1, 5, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (134, 126, '0,1,126', '通知撤回', 4, NULL, '', NULL, 'sys:notice:revoke', 0, 1, 1, 6, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (135, 1, '0,1', '字典数据', 1, 'DictData', 'dict-data', 'system/dict/data', NULL, 0, 1, 0, 6, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (136, 135, '0,1,135', '字典数据新增', 4, NULL, '', NULL, 'sys:dict-data:add', NULL, NULL, 1, 2, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (137, 135, '0,1,135', '字典数据编辑', 4, NULL, '', NULL, 'sys:dict-data:edit', NULL, NULL, 1, 3, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (138, 135, '0,1,135', '字典数据删除', 4, NULL, '', NULL, 'sys:dict-data:delete', NULL, NULL, 1, 4, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (139, 3, '0,1,3', '角色查询', 4, NULL, '', NULL, 'sys:role:query', NULL, NULL, 1, 1, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (140, 4, '0,1,4', '菜单查询', 4, NULL, '', NULL, 'sys:menu:query', NULL, NULL, 1, 1, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (141, 5, '0,1,5', '部门查询', 4, NULL, '', NULL, 'sys:dept:query', NULL, NULL, 1, 1, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (142, 6, '0,1,6', '字典查询', 4, NULL, '', NULL, 'sys:dict:query', NULL, NULL, 1, 1, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (143, 135, '0,1,135', '字典数据查询', 4, NULL, '', NULL, 'sys:dict-data:query', NULL, NULL, 1, 1, '', NULL,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', NULL),
       (144, 0, '0', '商品管理', 2, 'Pms', '/pms', 'Layout', '', 1, 1, 1, 2, 'el-icon-Goods', '/pms/goods', NULL, NULL,
        NULL),
       (145, 144, '0,144', '商品列表', 1, '', 'goods', 'pms/goods/index', '', 0, 1, 1, 2, 'goods-list', '', NULL, NULL,
        NULL),
       (146, 144, '0,144', '商品上架', 1, '', 'goods-detail', 'pms/goods/detail', '', 0, 1, 1, 3, 'publish', '', NULL,
        NULL, NULL);
/*!40000 ALTER TABLE `sys_menu`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_notice`
--

DROP TABLE IF EXISTS `sys_notice`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_notice`
(
    `id`              bigint     NOT NULL AUTO_INCREMENT,
    `title`           varchar(50)  DEFAULT NULL COMMENT '通知标题',
    `content`         text COMMENT '通知内容',
    `type`            tinyint    NOT NULL COMMENT '通知类型（关联字典编码：notice_type）',
    `level`           varchar(5) NOT NULL COMMENT '通知等级（字典code：notice_level）',
    `target_type`     tinyint    NOT NULL COMMENT '目标类型（1: 全体, 2: 指定）',
    `target_user_ids` varchar(255) DEFAULT NULL COMMENT '目标人ID集合（多个使用英文逗号,分割）',
    `publisher_id`    bigint       DEFAULT NULL COMMENT '发布人ID',
    `publish_status`  tinyint      DEFAULT '0' COMMENT '发布状态（0: 未发布, 1: 已发布, -1: 已撤回）',
    `publish_time`    datetime     DEFAULT NULL COMMENT '发布时间',
    `revoke_time`     datetime     DEFAULT NULL COMMENT '撤回时间',
    `create_by`       bigint     NOT NULL COMMENT '创建人ID',
    `create_time`     datetime   NOT NULL COMMENT '创建时间',
    `update_by`       bigint       DEFAULT NULL COMMENT '更新人ID',
    `update_time`     datetime     DEFAULT NULL COMMENT '更新时间',
    `is_deleted`      tinyint(1)   DEFAULT '0' COMMENT '是否删除（0: 未删除, 1: 已删除）',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 11
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='通知公告表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_notice`
--

LOCK TABLES `sys_notice` WRITE;
/*!40000 ALTER TABLE `sys_notice`
    DISABLE KEYS */;
INSERT INTO `sys_notice`
VALUES (1, 'v2.12.0 新增系统日志，访问趋势统计功能。', '<p>1. 消息通知</p><p>2. 字典重构</p><p>3. 代码生成</p>', 1, 'L',
        1, '2', 1, 1, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42',
        0),
       (2, 'v2.13.0 新增菜单搜索。', '<p>1. 消息通知</p><p>2. 字典重构</p><p>3. 代码生成</p>', 1, 'L', 1, '2', 1, 1,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 1, '2025-03-03 21:04:42', 0),
       (3, 'v2.14.0 新增个人中心。', '<p>1. 消息通知</p><p>2. 字典重构</p><p>3. 代码生成</p>', 1, 'L', 1, '2', 2, 1,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 0),
       (4, 'v2.15.0 登录页面改造。', '<p>1. 消息通知</p><p>2. 字典重构</p><p>3. 代码生成</p>', 1, 'L', 1, '2', 2, 1,
        '2025-03-03 21:04:42', '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 0),
       (5, 'v2.16.0 通知公告、字典翻译组件。', '<p>1. 消息通知</p><p>2. 字典重构</p><p>3. 代码生成</p>', 1, 'L', 1, '2',
        2, 1, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 0),
       (6, '系统将于本周六凌晨 2 点进行维护，预计维护时间为 2 小时。',
        '<p>1. 消息通知</p><p>2. 字典重构</p><p>3. 代码生成</p>', 2, 'H', 1, '2', 2, 1, '2025-03-03 21:04:42',
        '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 0),
       (7, '最近发现一些钓鱼邮件，请大家提高警惕，不要点击陌生链接。',
        '<p>1. 消息通知</p><p>2. 字典重构</p><p>3. 代码生成</p>', 3, 'L', 1, '2', 2, 1, '2025-03-03 21:04:42',
        '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 0),
       (8, '国庆假期从 10 月 1 日至 10 月 7 日放假，共 7 天。', '<p>1. 消息通知</p><p>2. 字典重构</p><p>3. 代码生成</p>',
        4, 'L', 1, '2', 2, 1, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 2,
        '2025-03-03 21:04:42', 0),
       (9, '公司将在 10 月 15 日举办新产品发布会，敬请期待。', '公司将在 10 月 15 日举办新产品发布会，敬请期待。', 5, 'H',
        1, '2', 2, 1, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42',
        0),
       (10, 'v2.16.1 版本发布。', 'v2.16.1 版本修复了 WebSocket 重复连接导致的后台线程阻塞问题，优化了通知公告。', 1, 'M',
        1, '2', 2, 1, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42', 2, '2025-03-03 21:04:42',
        0);
/*!40000 ALTER TABLE `sys_notice`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_role`
--

DROP TABLE IF EXISTS `sys_role`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_role`
(
    `id`          bigint      NOT NULL AUTO_INCREMENT,
    `name`        varchar(64) NOT NULL COMMENT '角色名称',
    `code`        varchar(32) NOT NULL COMMENT '角色编码',
    `sort`        int        DEFAULT NULL COMMENT '显示顺序',
    `status`      tinyint(1) DEFAULT '1' COMMENT '角色状态(1-正常 0-停用)',
    `data_scope`  tinyint    DEFAULT NULL COMMENT '数据权限(0-所有数据 1-部门及子部门数据 2-本部门数据3-本人数据)',
    `create_by`   bigint     DEFAULT NULL COMMENT '创建人 ID',
    `create_time` datetime   DEFAULT NULL COMMENT '创建时间',
    `update_by`   bigint     DEFAULT NULL COMMENT '更新人ID',
    `update_time` datetime   DEFAULT NULL COMMENT '更新时间',
    `is_deleted`  tinyint(1) DEFAULT '0' COMMENT '逻辑删除标识(0-未删除 1-已删除)',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `uk_name` (`name`) USING BTREE COMMENT '角色名称唯一索引',
    UNIQUE KEY `uk_code` (`code`) USING BTREE COMMENT '角色编码唯一索引'
) ENGINE = InnoDB
  AUTO_INCREMENT = 13
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='角色表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role`
--

LOCK TABLES `sys_role` WRITE;
/*!40000 ALTER TABLE `sys_role`
    DISABLE KEYS */;
INSERT INTO `sys_role`
VALUES (1, '超级管理员', 'ROOT', 1, 1, 0, NULL, '2025-03-03 21:04:42', NULL, '2025-03-03 21:04:42', 0),
       (2, '系统管理员', 'ADMIN', 2, 1, 0, NULL, '2025-03-03 21:04:42', NULL, NULL, 0),
       (3, '访问游客', 'GUEST', 3, 1, 2, NULL, '2025-03-03 21:04:42', NULL, '2025-03-03 21:04:42', 0),
       (4, '系统管理员1', 'ADMIN1', 4, 1, 1, NULL, '2025-03-03 21:04:42', NULL, NULL, 0),
       (5, '系统管理员2', 'ADMIN2', 5, 1, 1, NULL, '2025-03-03 21:04:42', NULL, NULL, 0),
       (6, '系统管理员3', 'ADMIN3', 6, 1, 1, NULL, '2025-03-03 21:04:42', NULL, NULL, 0),
       (7, '系统管理员4', 'ADMIN4', 7, 1, 1, NULL, '2025-03-03 21:04:42', NULL, NULL, 0),
       (8, '系统管理员5', 'ADMIN5', 8, 1, 1, NULL, '2025-03-03 21:04:42', NULL, NULL, 0),
       (9, '系统管理员6', 'ADMIN6', 9, 1, 1, NULL, '2025-03-03 21:04:42', NULL, NULL, 0),
       (10, '系统管理员7', 'ADMIN7', 10, 1, 1, NULL, '2025-03-03 21:04:42', NULL, NULL, 0),
       (11, '系统管理员8', 'ADMIN8', 11, 1, 1, NULL, '2025-03-03 21:04:42', NULL, NULL, 0),
       (12, '系统管理员9', 'ADMIN9', 12, 1, 1, NULL, '2025-03-03 21:04:42', NULL, NULL, 0);
/*!40000 ALTER TABLE `sys_role`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_role_menu`
--

DROP TABLE IF EXISTS `sys_role_menu`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_role_menu`
(
    `role_id` bigint NOT NULL COMMENT '角色ID',
    `menu_id` bigint NOT NULL COMMENT '菜单ID',
    UNIQUE KEY `uk_roleid_menuid` (`role_id`, `menu_id`) USING BTREE COMMENT '角色菜单唯一索引'
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='角色和菜单关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_role_menu`
--

LOCK TABLES `sys_role_menu` WRITE;
/*!40000 ALTER TABLE `sys_role_menu`
    DISABLE KEYS */;
INSERT INTO `sys_role_menu`
VALUES (2, 1),
       (2, 2),
       (2, 3),
       (2, 4),
       (2, 5),
       (2, 6),
       (2, 20),
       (2, 21),
       (2, 22),
       (2, 23),
       (2, 24),
       (2, 26),
       (2, 30),
       (2, 31),
       (2, 32),
       (2, 33),
       (2, 36),
       (2, 37),
       (2, 38),
       (2, 39),
       (2, 40),
       (2, 41),
       (2, 70),
       (2, 71),
       (2, 72),
       (2, 73),
       (2, 74),
       (2, 75),
       (2, 76),
       (2, 77),
       (2, 78),
       (2, 79),
       (2, 81),
       (2, 84),
       (2, 85),
       (2, 86),
       (2, 87),
       (2, 88),
       (2, 89),
       (2, 90),
       (2, 91),
       (2, 95),
       (2, 97),
       (2, 102),
       (2, 105),
       (2, 106),
       (2, 107),
       (2, 108),
       (2, 109),
       (2, 110),
       (2, 111),
       (2, 112),
       (2, 114),
       (2, 115),
       (2, 116),
       (2, 117),
       (2, 118),
       (2, 119),
       (2, 120),
       (2, 121),
       (2, 122),
       (2, 123),
       (2, 124),
       (2, 125),
       (2, 126),
       (2, 127),
       (2, 128),
       (2, 129),
       (2, 130),
       (2, 131),
       (2, 132),
       (2, 133),
       (2, 134),
       (2, 135),
       (2, 136),
       (2, 137),
       (2, 138),
       (2, 139),
       (2, 140),
       (2, 141),
       (2, 142),
       (2, 143),
       (2, 144),
       (2, 145),
       (2, 146);
/*!40000 ALTER TABLE `sys_role_menu`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_user`
--

DROP TABLE IF EXISTS `sys_user`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_user`
(
    `id`          bigint NOT NULL AUTO_INCREMENT,
    `username`    varchar(64)  DEFAULT NULL COMMENT '用户名',
    `nickname`    varchar(64)  DEFAULT NULL COMMENT '昵称',
    `gender`      tinyint(1)   DEFAULT '1' COMMENT '性别((1-男 2-女 0-保密)',
    `password`    varchar(100) DEFAULT NULL COMMENT '密码',
    `dept_id`     int          DEFAULT NULL COMMENT '部门ID',
    `avatar`      varchar(255) DEFAULT NULL COMMENT '用户头像',
    `mobile`      varchar(20)  DEFAULT NULL COMMENT '联系方式',
    `status`      tinyint(1)   DEFAULT '1' COMMENT '状态(1-正常 0-禁用)',
    `email`       varchar(128) DEFAULT NULL COMMENT '用户邮箱',
    `create_time` datetime     DEFAULT NULL COMMENT '创建时间',
    `create_by`   bigint       DEFAULT NULL COMMENT '创建人ID',
    `update_time` datetime     DEFAULT NULL COMMENT '更新时间',
    `update_by`   bigint       DEFAULT NULL COMMENT '修改人ID',
    `is_deleted`  tinyint(1)   DEFAULT '0' COMMENT '逻辑删除标识(0-未删除 1-已删除)',
    `openid`      char(28)     DEFAULT NULL COMMENT '微信 openid',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE KEY `login_name` (`username`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 4
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='用户信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_user`
--

LOCK TABLES `sys_user` WRITE;
/*!40000 ALTER TABLE `sys_user`
    DISABLE KEYS */;
INSERT INTO `sys_user`
VALUES (1, 'root', '有来技术', 0, '$2a$10$xVWsNOhHrCxh5UbpCE7/HuJ.PAOKcYAqRxD2CO2nVnJS.IAXkr5aq', NULL,
        'https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif', '18812345677', 1,
        'youlaitech@163.com', '2025-03-03 21:04:42', NULL, '2025-03-03 21:04:42', NULL, 0, NULL),
       (2, 'admin', '系统管理员', 1, '$2a$10$xVWsNOhHrCxh5UbpCE7/HuJ.PAOKcYAqRxD2CO2nVnJS.IAXkr5aq', 1,
        'https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif', '18812345678', 1,
        'youlaitech@163.com', '2025-03-03 21:04:42', NULL, '2025-03-03 21:04:42', NULL, 0, NULL),
       (3, 'test', '测试小用户', 1, '$2a$10$xVWsNOhHrCxh5UbpCE7/HuJ.PAOKcYAqRxD2CO2nVnJS.IAXkr5aq', 3,
        'https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif', '18812345679', 1,
        'youlaitech@163.com', '2025-03-03 21:04:42', NULL, '2025-03-03 21:04:42', NULL, 0, NULL);
/*!40000 ALTER TABLE `sys_user`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_user_notice`
--

DROP TABLE IF EXISTS `sys_user_notice`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_user_notice`
(
    `id`          bigint   NOT NULL AUTO_INCREMENT COMMENT 'id',
    `notice_id`   bigint   NOT NULL COMMENT '公共通知id',
    `user_id`     bigint   NOT NULL COMMENT '用户id',
    `is_read`     bigint   DEFAULT '0' COMMENT '读取状态（0: 未读, 1: 已读）',
    `read_time`   datetime DEFAULT NULL COMMENT '阅读时间',
    `create_time` datetime NOT NULL COMMENT '创建时间',
    `update_time` datetime DEFAULT NULL COMMENT '更新时间',
    `is_deleted`  tinyint  DEFAULT '0' COMMENT '逻辑删除(0: 未删除, 1: 已删除)',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 11
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='用户通知公告表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_user_notice`
--

LOCK TABLES `sys_user_notice` WRITE;
/*!40000 ALTER TABLE `sys_user_notice`
    DISABLE KEYS */;
INSERT INTO `sys_user_notice`
VALUES (1, 1, 2, 1, NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 0),
       (2, 2, 2, 1, NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 0),
       (3, 3, 2, 1, NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 0),
       (4, 4, 2, 1, NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 0),
       (5, 5, 2, 1, NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 0),
       (6, 6, 2, 1, NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 0),
       (7, 7, 2, 1, NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 0),
       (8, 8, 2, 1, NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 0),
       (9, 9, 2, 1, NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 0),
       (10, 10, 2, 1, NULL, '2025-03-03 21:04:42', '2025-03-03 21:04:42', 0);
/*!40000 ALTER TABLE `sys_user_notice`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sys_user_role`
--

DROP TABLE IF EXISTS `sys_user_role`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sys_user_role`
(
    `user_id` bigint NOT NULL COMMENT '用户ID',
    `role_id` bigint NOT NULL COMMENT '角色ID',
    PRIMARY KEY (`user_id`, `role_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci COMMENT ='用户和角色关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sys_user_role`
--

LOCK TABLES `sys_user_role` WRITE;
/*!40000 ALTER TABLE `sys_user_role`
    DISABLE KEYS */;
INSERT INTO `sys_user_role`
VALUES (1, 1),
       (2, 2),
       (3, 3);
/*!40000 ALTER TABLE `sys_user_role`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `undo_log`
--

DROP TABLE IF EXISTS `undo_log`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `undo_log`
(
    `branch_id`     bigint                                                        NOT NULL COMMENT 'branch transaction id',
    `xid`           varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'global transaction id',
    `context`       varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'undo_log context,such as serialization',
    `rollback_info` longblob                                                      NOT NULL COMMENT 'rollback info',
    `log_status`    int                                                           NOT NULL COMMENT '0:normal status,1:defense status',
    `log_created`   datetime(6)                                                   NOT NULL COMMENT 'create datetime',
    `log_modified`  datetime(6)                                                   NOT NULL COMMENT 'modify datetime',
    UNIQUE KEY `ux_undo_log` (`xid`, `branch_id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb3
  ROW_FORMAT = DYNAMIC COMMENT ='AT transaction mode undo table';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `undo_log`
--

LOCK TABLES `undo_log` WRITE;
/*!40000 ALTER TABLE `undo_log`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `undo_log`
    ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE = @OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE = @OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT = @OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS = @OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION = @OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES = @OLD_SQL_NOTES */;

-- Dump completed on 2025-05-01 12:30:49
