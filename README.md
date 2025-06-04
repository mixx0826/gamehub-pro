# GameHub Pro

一个现代化的HTML5游戏平台，支持游戏上传、管理和展示。具备完整的管理后台和双重存储解决方案。

## ✨ 特性

### 🎮 游戏平台
- **游戏展示**: 响应式游戏网格布局，支持分类筛选
- **游戏详情**: 沉浸式游戏详情页面，支持全屏播放
- **评分系统**: 用户评分和评论功能
- **移动支持**: 完全响应式设计，支持移动端游戏

### 📁 双重存储系统
- **GitHub存储**: 游戏文件永久存储在GitHub + GitHub Pages
  - 自动创建存储仓库
  - 自动启用GitHub Pages
  - 文件永久可访问，无需担心刷新丢失
- **本地存储**: 开发模式下的临时blob存储
  - 快速上传和测试
  - 页面刷新后需重新上传

### 🛠️ 管理后台
- **游戏管理**: 上传、编辑、删除游戏
- **存储模式**: 支持自动选择、GitHub存储、本地存储
- **文件支持**: ZIP、HTML、JS格式游戏文件
- **批量操作**: 批量管理游戏状态
- **上传历史**: 完整的操作记录追踪

### 🚀 部署支持
- **Vercel部署**: 优化的生产环境配置
- **环境变量**: 灵活的配置管理
- **缓存策略**: 智能静态资源缓存
- **SPA路由**: 完整的单页应用路由支持

## 📋 技术栈

- **前端框架**: React 18 + Vite
- **样式系统**: Tailwind CSS
- **路由**: React Router DOM
- **存储**: GitHub API + localStorage
- **部署**: Vercel + GitHub Pages

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd react_template
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境变量配置

复制环境变量模板：
```bash
cp .env.example .env
```

配置必要的环境变量：
```env
# GitHub存储配置（可选，用于生产环境）
VITE_GITHUB_TOKEN=ghp_your_github_personal_access_token
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_STORAGE_REPO=gamehub-storage

# 应用配置
VITE_APP_TITLE=GameHub Pro
VITE_APP_ENV=development
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173

## 🔧 环境变量说明

### GitHub存储配置
| 变量名 | 必需 | 说明 |
|--------|------|------|
| `VITE_GITHUB_TOKEN` | 可选 | GitHub Personal Access Token |
| `VITE_GITHUB_OWNER` | 可选 | GitHub用户名或组织名 |
| `VITE_GITHUB_STORAGE_REPO` | 可选 | 存储仓库名称（默认：gamehub-storage） |

### 应用配置
| 变量名 | 必需 | 说明 |
|--------|------|------|
| `VITE_APP_TITLE` | 否 | 应用标题 |
| `VITE_APP_ENV` | 否 | 环境标识 |

## 🔐 GitHub Token 配置

要启用GitHub存储功能，需要创建GitHub Personal Access Token：

### 1. 创建Token
1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 设置名称：`GameHub Pro Storage`
4. 选择权限：
   - ✅ `repo` (Full control of private repositories)
   - ✅ `public_repo` (Access public repositories)
   - ✅ `workflow` (Update GitHub Action workflows)

### 2. 配置Token
将生成的token添加到 `.env` 文件：
```env
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_GITHUB_OWNER=your_username
```

## 📦 部署到Vercel

### 1. 连接仓库
1. 登录 [Vercel](https://vercel.com/)
2. 点击 "New Project" 
3. 导入你的GitHub仓库

### 2. 配置环境变量
在Vercel项目设置中添加环境变量：
- `VITE_GITHUB_TOKEN`: 你的GitHub Token
- `VITE_GITHUB_OWNER`: 你的GitHub用户名
- `VITE_GITHUB_STORAGE_REPO`: 存储仓库名

### 3. 部署
Vercel会自动构建和部署项目。

## 📁 项目结构

```
src/
├── components/           # React组件
│   ├── Admin/           # 管理后台组件
│   │   ├── GameUpload/  # 游戏上传
│   │   ├── GameManagement/ # 游戏管理
│   │   └── Layout/      # 后台布局
│   ├── Layout/          # 前台布局
│   └── ...
├── config/              # 配置文件
│   └── github.js        # GitHub API配置
├── utils/               # 工具函数
│   ├── githubStorage.js # GitHub存储服务
│   └── adminStorage.js  # 本地数据管理
├── pages/               # 页面组件
├── data/                # 静态数据
└── hooks/               # React Hooks

public/
├── games/               # 平台游戏文件
├── test-games/          # 测试游戏
└── assets/              # 静态资源
```

## 🎮 游戏上传指南

### 支持的文件格式
- **ZIP文件**: 包含完整游戏的压缩包
- **HTML文件**: 单文件HTML游戏
- **JS文件**: JavaScript游戏文件

### 上传步骤
1. 进入管理后台 (`/admin`)
2. 选择"游戏上传"
3. 选择存储模式：
   - **自动选择**: 优先使用GitHub存储
   - **GitHub存储**: 强制使用GitHub（需要配置）
   - **本地存储**: 临时存储，适合测试
4. 拖拽或选择游戏文件和封面图片
5. 填写游戏信息
6. 点击上传

### 存储模式对比
| 特性 | GitHub存储 | 本地存储 |
|------|------------|----------|
| 持久性 | ✅ 永久保存 | ❌ 刷新后丢失 |
| 分享 | ✅ 可公开访问 | ❌ 仅本地可用 |
| 速度 | ⚡ 中等 | ⚡ 最快 |
| 配置 | 🔧 需要Token | 🟢 无需配置 |
| 用途 | 🚀 生产环境 | 🧪 开发测试 |

## 🛠️ 开发指南

### 添加新游戏
游戏数据存储在 `src/data/games.js`，可以添加平台内置游戏。

### 自定义主题
修改 `tailwind.config.js` 和相关CSS文件来自定义外观。

### API扩展
在 `src/utils/` 目录下添加新的API服务。

## 🐛 常见问题

### Q: GitHub存储上传失败？
A: 检查以下项目：
- GitHub Token是否有效且具有正确权限
- 仓库名称是否冲突
- 网络连接是否正常

### Q: 游戏无法加载？
A: 可能原因：
- 本地存储的游戏在页面刷新后blob URL失效
- GitHub Pages还未生效（需要等待几分钟）
- 游戏文件格式不支持

### Q: 如何迁移现有游戏？
A: 在游戏管理页面，可以将本地存储的游戏迁移到GitHub存储。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 🔗 相关链接

- [React 官方文档](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel 部署指南](https://vercel.com/docs)
- [GitHub API 文档](https://docs.github.com/en/rest)

---

🎮 **Happy Gaming!** 🎮
