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
- 开奖验证

## 游戏区位计算规则

游戏验证功能根据 `lotteryId`（游戏ID）和 `groupId`（玩法分组ID）来确定区位计算规则。

### 游戏ID对照表

| lotteryId | 游戏名称 | 号码数量 |
|-----------|---------|---------|
| 1 | 幸运28 | 3个 |
| 2 | 加拿大28 | 20个 |
| 3 | 韩国28 | 20个 |
| 4 | 美国28 | 6个 |
| 5 | 蛋蛋28 | 18个 |
| 6 | 宾果28 | 20个 |

### 计算方法说明

| 计算方法 | 说明 | 结果范围 |
|---------|------|---------|
| `lastDigit` | 区和值取尾数 (sum % 10) | 0-9 |
| `mod6Plus1` | 区和值余6加1 ((sum % 6) + 1) | 1-6 |
| `lastDigitPlus1` | 区和值取尾+1 ((sum % 10) + 1) | 1-10 |
| `direct` | 直接使用号码 | - |

### 幸运28 (lotteryId=1)

| groupId | 玩法名称 | 区位配置 | 计算方法 |
|---------|---------|---------|---------|
| 1, 2 | 和值/号码形态 | 直接使用3个号码 | direct |

### 加拿大28 (lotteryId=2)

| groupId | 玩法名称 | 一区 | 二区 | 三区 | 计算方法 |
|---------|---------|------|------|------|---------|
| 3 | 和值 | 第2,5,8,11,14,17位 [1,4,7,10,13,16] | 第3,6,9,12,15,18位 [2,5,8,11,14,17] | 第4,7,10,13,16,19位 [3,6,9,12,15,18] | lastDigit |
| 4 | 前七取尾 | 前7位 [0,1,2,3,4,5,6] | - | - | lastDigitPlus1 |
| 5 | 二取余 | 第1,4,7,10,13,16位 [0,3,6,9,12,15] | 第3,6,9,12,15,18位 [2,5,8,11,14,17] | - | mod6Plus1 |
| 6 | 三取余 | 第1,4,7,10,13,16位 [0,3,6,9,12,15] | 第2,5,8,11,14,17位 [1,4,7,10,13,16] | 第3,6,9,12,15,18位 [2,5,8,11,14,17] | mod6Plus1 |
| 7 | 号码形态 | 同 groupId=3 | 同 groupId=3 | 同 groupId=3 | lastDigit |
| 8 | 龙虎豹 | 同 groupId=3 | 同 groupId=3 | 同 groupId=3 | lastDigit |
| 9 | 大小单双 | 同 groupId=3 | 同 groupId=3 | 同 groupId=3 | lastDigit |

### 韩国28 (lotteryId=3)

| groupId | 玩法名称 | 一区 | 二区 | 三区 | 计算方法 |
|---------|---------|------|------|------|---------|
| 10 | 和值 | 第2,5,8,11,14,17位 [1,4,7,10,13,16] | 第3,6,9,12,15,18位 [2,5,8,11,14,17] | 第4,7,10,13,16,19位 [3,6,9,12,15,18] | lastDigit |
| 11 | 号码形态 | 同 groupId=10 | 同 groupId=10 | 同 groupId=10 | lastDigit |
| 12 | 龙虎豹 | 同 groupId=10 | 同 groupId=10 | 同 groupId=10 | lastDigit |
| 13 | 大小单双 | 同 groupId=10 | 同 groupId=10 | 同 groupId=10 | lastDigit |

### 美国28 (lotteryId=4)

美国游戏只有6个号码，计算前需要先排序。

| groupId | 玩法名称 | 一区 | 二区 | 三区 | 计算方法 |
|---------|---------|------|------|------|---------|
| 14 | 和值 | 第1,6位 [0,5] | 第2,4位 [1,3] | 第3,5位 [2,4] | lastDigit |
| 15 | 三取余 | 第2,5位 [1,4] | 第3,6位 [2,5] | 第4,6位 [3,5] | mod6Plus1 |
| 16 | 二取余 | 第2,5位 [1,4] | 第4,6位 [3,5] | - | mod6Plus1 |
| 17 | 号码形态 | 第1,6位 [0,5] | 第2,4位 [1,3] | 第3,5位 [2,4] | lastDigit |

### 蛋蛋28 (lotteryId=5)

| groupId | 玩法名称 | 一区 | 二区 | 三区 | 计算方法 |
|---------|---------|------|------|------|---------|
| 18 | 和值 | 第1-6位 [0,1,2,3,4,5] | 第7-12位 [6,7,8,9,10,11] | 第13-18位 [12,13,14,15,16,17] | lastDigit |
| 19 | 号码形态 | 同 groupId=18 | 同 groupId=18 | 同 groupId=18 | lastDigit |
| 20 | 龙虎豹 | 同 groupId=18 | 同 groupId=18 | 同 groupId=18 | lastDigit |
| 21 | 大小单双 | 同 groupId=18 | 同 groupId=18 | 同 groupId=18 | lastDigit |

### 宾果28 (lotteryId=6)

| groupId | 玩法名称 | 一区 | 二区 | 三区 | 计算方法 |
|---------|---------|------|------|------|---------|
| 22 | 和值 | 第2,5,8,11,14,17位 [1,4,7,10,13,16] | 第3,6,9,12,15,18位 [2,5,8,11,14,17] | 第4,7,10,13,16,19位 [3,6,9,12,15,18] | lastDigit |
| 23 | 二取余 | 第1,4,7,10,13,16位 [0,3,6,9,12,15] | 第3,6,9,12,15,18位 [2,5,8,11,14,17] | - | mod6Plus1 |
| 24 | 三取余 | 第2,5,8,11,14,17位 [1,4,7,10,13,16] | 第3,6,9,12,15,18位 [2,5,8,11,14,17] | 第4,7,10,13,16,19位 [3,6,9,12,15,18] | mod6Plus1 |
| 25 | 号码形态 | 同 groupId=22 | 同 groupId=22 | 同 groupId=22 | lastDigit |
| 26 | 前七取尾 | 前7位 [0,1,2,3,4,5,6] | - | - | lastDigitPlus1 |
| 27 | 龙虎豹 | 同 groupId=22 | 同 groupId=22 | 同 groupId=22 | lastDigit |
| 28 | 大小单双 | 同 groupId=22 | 同 groupId=22 | 同 groupId=22 | lastDigit |

### 计算示例

**美国28 和值 (lotteryId=4, groupId=14)**

原始号码: `10,13,31,42,60,19`
排序后: `10,13,19,31,42,60`

- 一区 (第1,6位): 10 + 60 = 70, 取尾 = **0**
- 二区 (第2,4位): 13 + 31 = 44, 取尾 = **4**
- 三区 (第3,5位): 19 + 42 = 61, 取尾 = **1**
- 最终结果: 0 + 4 + 1 = **5**

**加拿大28 三取余 (lotteryId=2, groupId=6)**

排序后号码: `1,2,3,...,20` (共20个)

- 一区 (第1,4,7,10,13,16位): sum1, (sum1 % 6) + 1 = **n1**
- 二区 (第2,5,8,11,14,17位): sum2, (sum2 % 6) + 1 = **n2**
- 三区 (第3,6,9,12,15,18位): sum3, (sum3 % 6) + 1 = **n3**
- 最终结果: n1 + n2 + n3

### 相关代码

区位计算逻辑位于 `src/views/Games.vue`:
- `getGameRuleByGroupId()` - 根据lotteryId和groupId获取区位规则
- `calculateVerifyFromActionNo()` - 执行区位计算

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
