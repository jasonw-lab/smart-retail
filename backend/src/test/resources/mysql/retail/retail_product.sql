use youlai_boot;

-- 商品テーブル: retail_product
CREATE TABLE IF NOT EXISTS retail_product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
    name VARCHAR(100) NOT NULL COMMENT '商品名',
    code VARCHAR(50) NOT NULL COMMENT '商品コード',
    price DECIMAL(10,2) NOT NULL COMMENT '価格',
    stock INT NOT NULL COMMENT '在庫数',
    description VARCHAR(255) COMMENT '商品説明',
    category_id BIGINT NOT NULL COMMENT 'カテゴリID',
    category_name VARCHAR(100) COMMENT 'カテゴリ名',
    sales INT DEFAULT 0 COMMENT '販売数',
    image_url VARCHAR(255) COMMENT '商品画像URL',
    expiry_date VARCHAR(20) COMMENT '賞味期限',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
    create_by BIGINT COMMENT '作成者',
    update_by BIGINT COMMENT '更新者',
    is_deleted TINYINT(1) DEFAULT 0 COMMENT '削除フラグ'
) COMMENT='商品マスタ';

-- 初期データ投入
INSERT INTO retail_product (id, name, code, price, stock, description, category_id, category_name, sales, image_url, expiry_date, create_time, update_time, create_by, update_by, is_deleted) VALUES
(1, 'プレミアムコーヒー', 'P0001', 980, 100, '高品質なコーヒー豆を使用したプレミアムコーヒー', 1, '飲料', 50, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop', '2024-12-31', NOW(), NOW(), NULL, NULL, 0),
(2, '石鹸', 'P0002', 280, 200, '肌に優しい天然成分配合の石鹸', 2, '日用品', 30, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200&h=200&fit=crop', '2025-06-30', NOW(), NOW(), NULL, NULL, 0),
(3, 'シャンプー', 'P0003', 680, 150, '髪の毛に潤いを与える高級シャンプー', 2, '日用品', 20, 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=200&h=200&fit=crop', '2025-03-31', NOW(), NOW(), NULL, NULL, 0),
(4, '緑茶', 'P0004', 380, 150, '香り高い日本の緑茶です。', 2, '飲料', 30, 'https://images.unsplash.com/photo-1582793988951-9aed5509eb97?w=200&h=200&fit=crop', '2024-11-30', NOW(), NOW(), NULL, NULL, 0),
(5, 'オーガニックティー', 'P0005', 780, 50, '有機栽培された茶葉を使用したオーガニックティー', 1, '飲料', 75, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop', '2025-06-30', NOW(), NOW(), NULL, NULL, 0),
(6, '天然水', 'P0006', 120, 200, '天然のミネラルを豊富に含む天然水', 2, '食品', 250, 'https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=200&h=200&fit=crop', '2025-03-31', NOW(), NOW(), NULL, NULL, 0),
(7, 'チョコレート', 'P0007', 280, 150, 'カカオ70%の高品質チョコレート', 3, '食品', 180, 'https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=200&h=200&fit=crop', '2024-12-31', NOW(), NOW(), NULL, NULL, 0),
(8, 'クッキー', 'P0008', 380, 80, 'バターの風味が豊かなクッキー', 3, '食品', 90, 'https://images.unsplash.com/photo-1558964122-2e32e1612f2d?w=200&h=200&fit=crop', '2024-09-30', NOW(), NOW(), NULL, NULL, 0),
(9, '紅茶', 'P0009', 680, 120, '芳醇な香りのセイロン紅茶', 1, '飲料', 150, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop', '2025-06-30', NOW(), NOW(), NULL, NULL, 0),
(10, 'ポテトチップス', 'P0010', 180, 200, 'サクサク食感のポテトチップス', 2, '食品', 90, 'https://images.unsplash.com/photo-1565402170291-8491f14678db?w=200&h=200&fit=crop', '2025-03-31', NOW(), NOW(), NULL, NULL, 0),
(11, 'キャンディー', 'P0011', 150, 300, 'フルーツ味のキャンディー', 2, '食品', 365, 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=200&h=200&fit=crop', '2025-06-30', NOW(), NOW(), NULL, NULL, 0),
(12, 'ハンドソープ', 'P0012', 380, 150, '保湿成分配合のハンドソープ', 3, '日用品', 180, 'https://images.unsplash.com/photo-1606813907290-d86a9c56a3b4?w=200&h=200&fit=crop', '2025-06-30', NOW(), NOW(), NULL, NULL, 0),
(13, '歯ブラシ', 'P0013', 320, 200, '使いやすい柔らかめの歯ブラシです。', 3, '日用品', 60, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=200&h=200&fit=crop', '2026-12-31', NOW(), NOW(), NULL, NULL, 0),
(14, 'ノート', 'P0014', 280, 300, '書きやすい上質な紙のノートです。', 4, '雑貨', 100, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=200&h=200&fit=crop', '2026-12-31', NOW(), NOW(), NULL, NULL, 0),
(15, 'ハーブティー', 'P0015', 580, 90, 'リラックス効果のあるハーブティー', 1, '飲料', 180, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop', '2025-12-31', NOW(), NOW(), NULL, NULL, 0),
(16, 'スポンジ', 'P0016', 280, 200, 'キッチン用スポンジ', 3, '日用品', 365, 'https://images.unsplash.com/photo-1606813907290-d86a9c56a3b4?w=200&h=200&fit=crop', '2025-06-30', NOW(), NOW(), NULL, NULL, 0),
(17, '収納ボックス', 'P0017', 1280, 50, 'スタッキング可能な収納ボックス', 4, '日用品', 1825, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop', '2025-12-31', NOW(), NOW(), NULL, NULL, 0),
(18, 'フォトフレーム', 'P0018', 980, 80, '木製フォトフレーム', 4, '日用品', 1825, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=200&fit=crop', '2025-06-30', NOW(), NOW(), NULL, NULL, 0);

-- System tables required for security

-- Table structure for sys_menu
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu`  (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `parent_id` bigint NOT NULL COMMENT '父菜单ID',
    `tree_path` varchar(255) COMMENT '父节点ID路径',
    `name` varchar(64) NOT NULL COMMENT '菜单名称',
    `type` tinyint NOT NULL COMMENT '菜单类型（1-菜单 2-目录 3-外链 4-按钮）',
    `route_name` varchar(255) COMMENT '路由名称（Vue Router 中用于命名路由）',
    `route_path` varchar(128) COMMENT '路由路径（Vue Router 中定义的 URL 路径）',
    `component` varchar(128) COMMENT '组件路径（组件页面完整路径，相对于 src/views/，缺省后缀 .vue）',
    `perm` varchar(128) COMMENT '【按钮】权限标识',
    `always_show` tinyint DEFAULT 0 COMMENT '【目录】只有一个子路由是否始终显示（1-是 0-否）',
    `keep_alive` tinyint DEFAULT 0 COMMENT '【菜单】是否开启页面缓存（1-是 0-否）',
    `visible` tinyint(1) DEFAULT 1 COMMENT '显示状态（1-显示 0-隐藏）',
    `sort` int DEFAULT 0 COMMENT '排序',
    `icon` varchar(64) COMMENT '菜单图标',
    `redirect` varchar(128) COMMENT '跳转路径',
    `create_time` datetime NULL COMMENT '创建时间',
    `update_time` datetime NULL COMMENT '更新时间',
    `params` varchar(255) NULL COMMENT '路由参数',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COMMENT = '菜单管理';

-- Minimal menu records
INSERT INTO `sys_menu` VALUES (1, 0, '0', '系统管理', 2, '', '/system', 'Layout', NULL, NULL, NULL, 1, 1, 'system', '/system/user', now(), now(), NULL);
INSERT INTO `sys_menu` VALUES (2, 1, '0,1', '用户管理', 1, 'User', 'user', 'system/user/index', NULL, NULL, 1, 1, 1, 'el-icon-User', NULL, now(), now(), NULL);
INSERT INTO `sys_menu` VALUES (3, 1, '0,1', '角色管理', 1, 'Role', 'role', 'system/role/index', NULL, NULL, 1, 1, 2, 'role', NULL, now(), now(), NULL);
INSERT INTO `sys_menu` VALUES (4, 1, '0,1', '菜单管理', 1, 'SysMenu', 'menu', 'system/menu/index', NULL, NULL, 1, 1, 3, 'menu', NULL, now(), now(), NULL);

-- Table structure for sys_role
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role`  (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `name` varchar(64) NOT NULL COMMENT '角色名称',
    `code` varchar(32) NOT NULL COMMENT '角色编码',
    `sort` int NULL COMMENT '显示顺序',
    `status` tinyint(1) DEFAULT 1 COMMENT '角色状态(1-正常 0-停用)',
    `data_scope` tinyint NULL COMMENT '数据权限(0-所有数据 1-部门及子部门数据 2-本部门数据3-本人数据)',
    `create_by` bigint NULL COMMENT '创建人 ID',
    `create_time` datetime NULL COMMENT '创建时间',
    `update_by` bigint NULL COMMENT '更新人ID',
    `update_time` datetime NULL COMMENT '更新时间',
    `is_deleted` tinyint(1) DEFAULT 0 COMMENT '逻辑删除标识(0-未删除 1-已删除)',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE INDEX `uk_name`(`name` ASC) USING BTREE COMMENT '角色名称唯一索引',
    UNIQUE INDEX `uk_code`(`code` ASC) USING BTREE COMMENT '角色编码唯一索引'
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COMMENT = '角色表';

-- Minimal role records
INSERT INTO `sys_role` VALUES (1, '超级管理员', 'ROOT', 1, 1, 0, NULL, now(), NULL, now(), 0);
INSERT INTO `sys_role` VALUES (2, '系统管理员', 'ADMIN', 2, 1, 0, NULL, now(), NULL, NULL, 0);

-- Table structure for sys_role_menu
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu`  (
    `role_id` bigint NOT NULL COMMENT '角色ID',
    `menu_id` bigint NOT NULL COMMENT '菜单ID',
    UNIQUE INDEX `uk_roleid_menuid`(`role_id` ASC, `menu_id` ASC) USING BTREE COMMENT '角色菜单唯一索引'
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COMMENT = '角色和菜单关联表';

-- Minimal role-menu records
INSERT INTO `sys_role_menu` VALUES (2, 1);
INSERT INTO `sys_role_menu` VALUES (2, 2);
INSERT INTO `sys_role_menu` VALUES (2, 3);
INSERT INTO `sys_role_menu` VALUES (2, 4);

-- Table structure for sys_user
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `username` varchar(64) COMMENT '用户名',
    `nickname` varchar(64) COMMENT '昵称',
    `gender` tinyint(1) DEFAULT 1 COMMENT '性别((1-男 2-女 0-保密)',
    `password` varchar(100) COMMENT '密码',
    `dept_id` int COMMENT '部门ID',
    `avatar` varchar(255) COMMENT '用户头像',
    `mobile` varchar(20) COMMENT '联系方式',
    `status` tinyint(1) DEFAULT 1 COMMENT '状态(1-正常 0-禁用)',
    `email` varchar(128) COMMENT '用户邮箱',
    `create_time` datetime COMMENT '创建时间',
    `create_by` bigint COMMENT '创建人ID',
    `update_time` datetime COMMENT '更新时间',
    `update_by` bigint COMMENT '修改人ID',
    `is_deleted` tinyint(1) DEFAULT 0 COMMENT '逻辑删除标识(0-未删除 1-已删除)',
    `openid` char(28) COMMENT '微信 openid',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE INDEX `login_name`(`username` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COMMENT = '用户信息表';

-- Minimal user records
INSERT INTO `sys_user` VALUES (1, 'root', '有来技术', 0, '$2a$10$xVWsNOhHrCxh5UbpCE7/HuJ.PAOKcYAqRxD2CO2nVnJS.IAXkr5aq', NULL, 'https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif', '18812345677', 1, 'youlaitech@163.com', now(), NULL, now(), NULL, 0,NULL);
INSERT INTO `sys_user` VALUES (2, 'admin', '系统管理员', 1, '$2a$10$xVWsNOhHrCxh5UbpCE7/HuJ.PAOKcYAqRxD2CO2nVnJS.IAXkr5aq', 1, 'https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif', '18812345678', 1, 'youlaitech@163.com', now(), NULL, now(), NULL, 0,NULL);

-- Table structure for sys_user_role
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role`  (
    `user_id` bigint NOT NULL COMMENT '用户ID',
    `role_id` bigint NOT NULL COMMENT '角色ID',
    PRIMARY KEY (`user_id`, `role_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COMMENT = '用户和角色关联表';

-- Minimal user-role records
INSERT INTO `sys_user_role` VALUES (1, 1);
INSERT INTO `sys_user_role` VALUES (2, 2);

-- Table structure for sys_dept
DROP TABLE IF EXISTS `sys_dept`;
CREATE TABLE `sys_dept`  (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name` varchar(100) NOT NULL COMMENT '部门名称',
    `code` varchar(100) NOT NULL COMMENT '部门编号',
    `parent_id` bigint DEFAULT 0 COMMENT '父节点id',
    `tree_path` varchar(255) NOT NULL COMMENT '父节点id路径',
    `sort` smallint DEFAULT 0 COMMENT '显示顺序',
    `status` tinyint DEFAULT 1 COMMENT '状态(1-正常 0-禁用)',
    `create_by` bigint NULL COMMENT '创建人ID',
    `create_time` datetime NULL COMMENT '创建时间',
    `update_by` bigint NULL COMMENT '修改人ID',
    `update_time` datetime NULL COMMENT '更新时间',
    `is_deleted` tinyint DEFAULT 0 COMMENT '逻辑删除标识(1-已删除 0-未删除)',
    PRIMARY KEY (`id`) USING BTREE,
    UNIQUE INDEX `uk_code`(`code` ASC) USING BTREE COMMENT '部门编号唯一索引'
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COMMENT = '部门表';

-- Minimal department records
INSERT INTO `sys_dept` VALUES (1, '有来技术', 'YOULAI', 0, '0', 1, 1, 1, NULL, 1, now(), 0);