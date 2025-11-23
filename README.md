# TimeGarden

一个任务发布和协作平台，连接任务发布者和服务提供者。

## 项目结构

```
TimeGarden_demo/
├── frontend/          # 前端应用 (React + TypeScript + Vite)
│   ├── src/          # 源代码
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── services/      # API 服务
│   │   ├── types/         # 类型定义
│   │   └── utils/         # 工具函数
│   └── package.json
├── backend/          # 后端 API (Node.js + Express + MySQL)
│   ├── config/       # 配置
│   ├── controllers/  # 控制器
│   ├── routes/       # 路由
│   ├── middleware/   # 中间件
│   └── utils/        # 工具函数
└── package.json      # 根目录脚本
```

## 快速开始

### 安装所有依赖

```bash
npm run install:all
```

或者分别安装：

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend && npm install

# 安装后端依赖
cd ../backend && npm install
```

### 配置环境变量

**前端配置** (`frontend/.env.local`):
```
VITE_API_KEY=your_gemini_api_key
```

**后端配置** (`backend/.env`):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=TimeGarden
DB_PORT=3306
```

### 初始化数据库

```bash
cd backend
mysql -u root < schema.sql
```

### 启动项目

**方式 1: 同时启动前后端**
```bash
npm run dev:all
```

**方式 2: 分别启动**

终端 1 - 启动后端:
```bash
npm run dev:backend
# 或
cd backend && npm start
```

终端 2 - 启动前端:
```bash
npm run dev:frontend
# 或
cd frontend && npm run dev
```

### 访问应用

- 前端: http://localhost:5173
- 后端 API: http://localhost:4000

## 开发脚本

### 根目录脚本

- `npm run dev` - 启动前端开发服务器
- `npm run dev:frontend` - 启动前端
- `npm run dev:backend` - 启动后端
- `npm run dev:all` - 同时启动前后端
- `npm run build` - 构建前端生产版本
- `npm run install:all` - 安装所有依赖

### 前端脚本 (`frontend/`)

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建

### 后端脚本 (`backend/`)

- `npm start` - 启动服务器
- `npm run dev` - 启动开发服务器 (需要 nodemon)

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Recharts
- Lucide React

### 后端
- Node.js
- Express
- MySQL
- mysql2

## 项目特性

- ✅ 模块化的前后端结构
- ✅ TypeScript 类型安全
- ✅ RESTful API
- ✅ 响应式设计
- ✅ 任务发布和管理
- ✅ 提案和合同系统
- ✅ 钱包和交易管理
- ✅ 消息系统
