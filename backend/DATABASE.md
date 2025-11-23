# 数据库配置说明

## 数据库类型

**当前使用：本地 MySQL 数据库**

- 数据库服务器：localhost (本地)
- 默认端口：3306
- 数据库名称：TimeGarden
- 连接方式：Socket 连接（macOS 无密码）或 TCP/IP（有密码时）

## 数据库结构

### Users 表（已更新）

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,  -- 新增：密码哈希
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 主要变更

1. ✅ 添加了 `password_hash` 字段用于存储加密后的密码
2. ✅ 添加了 `created_at` 和 `updated_at` 时间戳字段
3. ✅ 密码使用 bcrypt 加密（10 rounds）

## 配置方式

### 1. 环境变量配置 (`backend/.env`)

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # 如果 MySQL 有密码，填写这里；无密码留空
DB_NAME=TimeGarden
DB_PORT=3306
```

### 2. 连接方式

- **无密码（macOS 默认）**：使用 Socket 连接 (`/tmp/mysql.sock`)
- **有密码**：使用 TCP/IP 连接 (`localhost:3306`)

## 初始化数据库

### 全新安装

```bash
cd backend
mysql -u root < schema.sql
```

### 更新现有数据库

如果已有数据库，运行迁移脚本：

```bash
cd backend
mysql -u root < migrations/add_password_to_users.sql
```

## 迁移说明

### 现有用户处理

迁移脚本会为现有用户设置一个默认密码哈希。**在生产环境中，应该：**

1. 强制现有用户重置密码
2. 发送密码重置邮件
3. 或要求用户首次登录时设置密码

### 测试用户

现有测试用户（如 Bob Smith, id=2）需要设置密码才能登录。可以通过以下方式：

1. 使用注册功能创建新用户
2. 或手动更新测试用户的密码哈希

## 安全注意事项

1. ✅ 密码使用 bcrypt 加密（不可逆）
2. ✅ 密码哈希存储在数据库中，明文密码从不存储
3. ✅ 密码最小长度：6 个字符
4. ⚠️ 生产环境建议：
   - 使用更强的密码策略（至少 8 位，包含大小写字母和数字）
   - 实现 JWT token 认证
   - 添加登录尝试限制
   - 实现密码重置功能

## 切换到远程数据库

如果需要使用远程数据库（如云数据库），修改 `.env`：

```env
DB_HOST=your-database-host.com
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=TimeGarden
DB_PORT=3306
```

连接会自动切换到 TCP/IP 模式。

## 验证连接

```bash
# 测试数据库连接
mysql -u root -e "USE TimeGarden; SELECT COUNT(*) FROM users;"

# 检查表结构
mysql -u root -e "USE TimeGarden; DESCRIBE users;"
```

