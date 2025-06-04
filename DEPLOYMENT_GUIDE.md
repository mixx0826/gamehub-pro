# 🚀 GameHub Pro 部署指南

## 📋 部署概览

GameHub Pro 现已推送到 GitHub，可以快速部署到 Vercel 平台。

### 🔗 项目链接
- **GitHub 仓库**: https://github.com/mixx0826/gamehub-pro
- **项目描述**: 🎮 现代化HTML5游戏平台，支持双重存储系统

---

## 🚀 一键部署到 Vercel

### 方式1：通过 Vercel Dashboard（推荐）

#### 第1步：连接 GitHub
1. 访问 [Vercel.com](https://vercel.com/) 并登录
2. 点击 "New Project" 
3. 选择 "Import Git Repository"
4. 连接您的 GitHub 账户（如果还未连接）
5. 搜索并选择 `gamehub-pro` 仓库

#### 第2步：配置项目设置
Vercel 会自动检测到这是一个 React + Vite 项目，使用以下配置：
- **Framework Preset**: Vite
- **Root Directory**: `./`（保持默认）
- **Build Command**: `npm run build`（保持默认）
- **Output Directory**: `dist`（保持默认）

#### 第3步：配置环境变量（可选）
如果要启用 GitHub 存储功能，需要添加环境变量：

```env
VITE_GITHUB_TOKEN=your_github_personal_access_token
VITE_GITHUB_OWNER=mixx0826
VITE_GITHUB_STORAGE_REPO=gamehub-storage
```

**获取 GitHub Token 步骤**:
1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 设置名称：`GameHub Pro Storage`
4. 选择权限：
   - ✅ `repo` (Full control of private repositories)
   - ✅ `public_repo` (Access public repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. 复制生成的 token

#### 第4步：部署
点击 "Deploy" 按钮，Vercel 将自动：
- 克隆代码
- 安装依赖 (`npm install`)
- 构建项目 (`npm run build`)
- 部署到全球 CDN

### 方式2：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目目录中部署
vercel

# 按照提示进行设置
# - Set up and deploy? [Y/n] y
# - Which scope? 选择您的账户
# - Link to existing project? [y/N] n
# - What's your project's name? gamehub-pro
# - In which directory is your code located? ./
```

---

## 🎮 部署后配置

### 1. 域名设置
部署成功后，Vercel 会提供一个免费域名：
- **格式**: `https://gamehub-pro-xxx.vercel.app`
- **可在项目设置中自定义域名**

### 2. GitHub 存储配置
如果添加了 GitHub Token 环境变量：
- 系统将自动创建 `gamehub-storage` 仓库
- 启用 GitHub Pages 功能
- 上传的游戏文件将永久保存

### 3. 性能优化
项目已包含 `vercel.json` 配置文件，自动启用：
- ✅ 静态资源缓存
- ✅ SPA 路由支持
- ✅ Gzip 压缩
- ✅ 环境变量映射

---

## 🛠️ 本地开发

```bash
# 克隆仓库
git clone https://github.com/mixx0826/gamehub-pro.git
cd gamehub-pro

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 环境变量配置（本地开发）
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，添加 GitHub 配置（可选）
VITE_GITHUB_TOKEN=your_token_here
VITE_GITHUB_OWNER=mixx0826
VITE_GITHUB_STORAGE_REPO=gamehub-storage
```

---

## 📊 功能验证

### 部署后检查清单
- [ ] 🏠 首页正常显示游戏列表
- [ ] 🎮 可以正常访问和播放游戏
- [ ] 🔐 管理后台登录功能正常（密码：admin123）
- [ ] ⬆️ 游戏上传功能正常
- [ ] 📱 移动端响应式布局正常
- [ ] 🔧 GitHub 存储功能（如果配置了环境变量）

### 测试访问路径
- **首页**: `/`
- **游戏目录**: `/games`
- **管理后台**: `/admin`
- **游戏详情**: `/game/[id]`

---

## 🔧 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 检查本地构建是否正常
npm run build

# 如果本地构建成功，检查 Vercel 环境变量配置
```

#### 2. 游戏无法加载
- 检查游戏文件路径是否正确
- 确认 `public/` 目录中的游戏文件是否上传

#### 3. GitHub 存储不工作
- 验证 GitHub Token 权限
- 检查环境变量是否正确设置
- 查看浏览器控制台错误信息

#### 4. 管理后台无法访问
- 确认路由 `/admin` 可访问
- 默认密码：`admin123`

### 获取帮助
- **项目文档**: README.md
- **GitHub Issues**: https://github.com/mixx0826/gamehub-pro/issues
- **Vercel 文档**: https://vercel.com/docs

---

## 🎯 下一步优化

### 1. 自定义域名
在 Vercel 项目设置中添加自定义域名

### 2. 分析和监控
启用 Vercel Analytics 监控网站性能

### 3. 数据库集成
考虑集成 Vercel Postgres 或 MongoDB 进行数据持久化

### 4. CDN 优化
为游戏文件配置专用 CDN 服务

---

🎮 **Happy Gaming!** 🚀 **Happy Deploying!** 