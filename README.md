# 鼎丰28 PC端

基于 Vue 3 + TypeScript + Vite 构建的PC端Web应用。

## 技术栈

- **框架**: Vue 3.5 (Composition API)
- **构建工具**: Vite 6
- **语言**: TypeScript 5.7
- **状态管理**: Pinia 3 + pinia-plugin-persistedstate
- **路由**: Vue Router 4
- **国际化**: Vue I18n 11
- **HTTP客户端**: Axios
- **样式**: Tailwind CSS 3 + 传统CSS
- **加密**: libsodium-wrappers
- **工具库**: dayjs, decimal.js, @vueuse/core

## 环境要求

- Node.js >= 18.0.0
- npm 或 yarn

## 安装

```bash
npm install
```

## 开发

```bash
npm run dev
```

开发服务器默认运行在 http://localhost:5173

## 构建

```bash
npm run build
```

构建产物输出到 `dist` 目录

## 预览

```bash
npm run preview
```

预览生产构建

## 项目结构

```
src/
├── api/                # API接口定义
│   ├── auth.ts         # 认证相关接口
│   ├── common.ts       # 公共接口
│   ├── customer.ts     # 用户相关接口
│   ├── home.ts         # 首页接口
│   ├── rank.ts         # 排行榜接口
│   └── shop.ts         # 商城接口
├── components/         # 公共组件
│   ├── home/           # 首页组件
│   └── layout/         # 布局组件
│       ├── Header.vue  # 头部导航
│       ├── Footer.vue  # 页脚
│       ├── MainLayout.vue    # 主布局
│       └── UserLayout.vue    # 用户中心布局
├── locales/            # 国际化文件
├── router/             # 路由配置
├── stores/             # Pinia状态管理
│   ├── auth.ts         # 认证状态
│   └── config.ts       # 系统配置状态
├── types/              # TypeScript类型定义
│   ├── index.type.ts   # 通用类型
│   ├── customer.type.ts # 用户相关类型
│   ├── rank.type.ts    # 排行榜类型
│   └── shop.type.ts    # 商城类型
├── utils/              # 工具函数
│   ├── http.ts         # HTTP请求封装
│   └── sodium.ts       # 加密工具
├── views/              # 页面组件
│   ├── Home.vue        # 首页
│   ├── Games.vue       # 游戏页面
│   ├── Shop.vue        # 商城
│   ├── Promotion.vue   # 推广页面
│   ├── Partners.vue    # 合作商
│   ├── Activity.vue    # 活动中心
│   └── user/           # 用户中心页面
│       ├── Index.vue   # 用户首页
│       ├── Checkin.vue # 签到
│       ├── Welfare.vue # 领救济
│       ├── Exchange.vue # 兑奖记录
│       └── ...
├── App.vue             # 根组件
└── main.ts             # 入口文件
```

## 主要功能模块

### 1. 用户认证
- 登录/注册/忘记密码
- Token管理与自动刷新
- 密码加密传输 (libsodium)

### 2. 首页
- 轮播图
- 公告系统
- 弹窗公告
- 提现动态滚动
- 排行榜 (今日/昨日)
- 热门/最新游戏展示
- 商城商品展示

### 3. 游戏中心
- 多彩种支持
- 开奖记录
- 投注面板
- 我的投注记录

### 4. 用户中心
- 个人信息
- 签到系统
- 工资领取
- 救济金领取
- 兑奖记录
- 推广系统

### 5. 商城
- 商品展示
- 兑换功能

## 状态管理

### auth store
管理用户认证状态，包括:
- Token存储与刷新
- 用户信息
- 登录状态

### config store
管理系统配置，实现配置缓存避免重复请求:
- 系统配置 (sysConfig)
- QQ客服号
- 移动端链接
- 应用名称/Logo

## API接口

所有API接口统一使用 `src/utils/http.ts` 封装的axios实例，支持:
- 请求/响应拦截
- Token自动携带
- 统一错误处理

## 环境变量

在项目根目录创建 `.env` 文件配置环境变量:

```env
VITE_API_BASE_URL=https://api.example.com
```
