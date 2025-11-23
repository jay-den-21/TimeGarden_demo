# 故障排除指南

## 如果无法打开应用

### 1. 检查服务器是否运行

```bash
# 检查端口是否被占用
lsof -ti:4000,5173

# 应该看到两个进程 ID
```

### 2. 手动启动服务器

**方式 1: 同时启动**
```bash
cd /Users/caohuixi/TimeGarden_demo
npm run dev:all
```

**方式 2: 分别启动**

终端 1 - 后端:
```bash
cd backend
npm start
```

终端 2 - 前端:
```bash
cd frontend
npm run dev
```

### 3. 检查浏览器控制台

1. 打开浏览器开发者工具 (F12 或 Cmd+Option+I)
2. 查看 Console 标签页是否有错误
3. 查看 Network 标签页检查请求是否成功

### 4. 常见问题

#### 问题 1: 页面显示空白
- **原因**: JavaScript 错误
- **解决**: 查看浏览器控制台的错误信息

#### 问题 2: 无法连接到后端
- **原因**: 后端服务器未启动
- **解决**: 确保后端在 `http://localhost:4000` 运行

#### 问题 3: CORS 错误
- **原因**: 跨域请求被阻止
- **解决**: 检查 `backend/server.js` 中的 CORS 配置

#### 问题 4: 路由不工作
- **原因**: HashRouter 配置问题
- **解决**: 确保使用 `/#/` 前缀访问路由

### 5. 访问地址

- **前端首页**: http://localhost:5173
- **登录页面**: http://localhost:5173/#/login
- **注册页面**: http://localhost:5173/#/register
- **后端 API**: http://localhost:4000/api
- **健康检查**: http://localhost:4000/api/health

### 6. 重启服务器

如果遇到问题，尝试重启：

```bash
# 停止所有服务器
lsof -ti:4000,5173 | xargs kill

# 重新启动
cd /Users/caohuixi/TimeGarden_demo
npm run dev:all
```

### 7. 检查数据库连接

```bash
# 测试数据库连接
mysql -u root -e "USE TimeGarden; SELECT COUNT(*) FROM users;"
```

### 8. 查看服务器日志

检查终端输出中的错误信息，特别是：
- 数据库连接错误
- 端口占用错误
- 模块导入错误

