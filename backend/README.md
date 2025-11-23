# TimeGarden Backend

## 项目结构

```
backend/
├── config/              # 配置文件
│   └── database.js     # 数据库连接配置
├── controllers/         # 控制器（业务逻辑）
│   ├── usersController.js
│   ├── walletController.js
│   ├── tasksController.js
│   ├── proposalsController.js
│   ├── contractsController.js
│   ├── messagesController.js
│   └── reviewsController.js
├── routes/             # 路由定义
│   ├── index.js        # 路由入口
│   ├── users.js
│   ├── wallet.js
│   ├── transactions.js
│   ├── tasks.js
│   ├── proposals.js
│   ├── contracts.js
│   ├── messages.js
│   └── reviews.js
├── middleware/         # 中间件
│   └── auth.js         # 认证中间件
├── utils/              # 工具函数
│   └── statusNormalizer.js
├── server.js           # 主入口文件
├── schema.sql          # 数据库架构
└── package.json
```

## 架构说明

### 分层架构
- **Routes (路由层)**: 定义 API 端点，处理 HTTP 请求
- **Controllers (控制器层)**: 处理业务逻辑，与数据库交互
- **Middleware (中间件层)**: 处理认证、验证等横切关注点
- **Config (配置层)**: 数据库连接等配置信息
- **Utils (工具层)**: 可复用的工具函数

### 每个前端功能对应一个后端模块

- **Users** → `routes/users.js` + `controllers/usersController.js`
- **Wallet** → `routes/wallet.js` + `controllers/walletController.js`
- **Transactions** → `routes/transactions.js` + `controllers/walletController.js`
- **Tasks** → `routes/tasks.js` + `controllers/tasksController.js`
- **Proposals** → `routes/proposals.js` + `controllers/proposalsController.js`
- **Contracts** → `routes/contracts.js` + `controllers/contractsController.js`
- **Messages** → `routes/messages.js` + `controllers/messagesController.js`
- **Reviews** → `routes/reviews.js` + `controllers/reviewsController.js`

## 启动项目

```bash
cd backend
npm install
npm start
```

服务器将在 `http://localhost:4000` 启动

## API 端点

所有 API 端点都以 `/api` 为前缀：

- `GET /api/health` - 健康检查
- `GET /api/users/me` - 获取当前用户信息
- `GET /api/wallet` - 获取钱包信息
- `GET /api/transactions` - 获取交易记录
- `GET /api/tasks` - 获取所有任务
- `GET /api/tasks/my` - 获取我的任务
- `GET /api/tasks/:id` - 获取任务详情
- `GET /api/proposals/my` - 获取我的提案
- `GET /api/proposals/task/:taskId` - 获取任务的提案
- `GET /api/contracts` - 获取我的合同
- `GET /api/contracts/:id` - 获取合同详情
- `GET /api/threads` - 获取消息线程
- `GET /api/threads/:id/messages` - 获取线程消息
- `GET /api/reviews/user/:userId` - 获取用户评价

