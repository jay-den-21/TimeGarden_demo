# TimeGarden Frontend

## 项目结构

```
frontend/
├── src/                    # 源代码目录
│   ├── components/         # 可复用组件
│   │   └── Layout.tsx      # 布局组件
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx
│   │   ├── BrowseTasks.tsx
│   │   ├── TaskCreate.tsx
│   │   ├── TaskDetails.tsx
│   │   ├── Wallet.tsx
│   │   ├── Contracts.tsx
│   │   ├── ContractDetails.tsx
│   │   ├── Messages.tsx
│   │   └── Proposals.tsx
│   ├── services/           # API 服务
│   │   ├── mockDatabase.ts
│   │   └── geminiService.ts
│   ├── types/              # TypeScript 类型定义
│   │   └── types.ts
│   ├── utils/              # 工具函数
│   ├── data/               # 模拟数据
│   │   └── mockData.ts
│   ├── assets/             # 静态资源
│   ├── App.tsx             # 主应用组件
│   └── main.tsx            # 入口文件
├── public/                 # 公共静态资源
├── index.html              # HTML 模板
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 依赖配置
```

## 架构说明

### 目录职责

- **components/**: 可复用的 UI 组件
- **pages/**: 路由对应的页面组件
- **services/**: API 调用和数据服务
- **types/**: TypeScript 类型定义
- **utils/**: 工具函数和辅助方法
- **data/**: 模拟数据和常量
- **assets/**: 图片、字体等静态资源

### 每个页面对应一个组件

- **Dashboard** → `pages/Dashboard.tsx`
- **BrowseTasks** → `pages/BrowseTasks.tsx`
- **TaskCreate** → `pages/TaskCreate.tsx`
- **TaskDetails** → `pages/TaskDetails.tsx`
- **Wallet** → `pages/Wallet.tsx`
- **Contracts** → `pages/Contracts.tsx`
- **ContractDetails** → `pages/ContractDetails.tsx`
- **Messages** → `pages/Messages.tsx`
- **Proposals** → `pages/Proposals.tsx`

## 启动项目

```bash
cd frontend
npm install
npm run dev
```

前端服务器将在 `http://localhost:5173` 启动

## 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录

