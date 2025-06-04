# GameHub Pro 生产环境部署指南

## 目录
1. [系统要求](#系统要求)
2. [环境准备](#环境准备)
3. [部署步骤](#部署步骤)
4. [配置管理](#配置管理)
5. [监控与维护](#监控与维护)
6. [备份策略](#备份策略)
7. [安全配置](#安全配置)
8. [性能优化](#性能优化)
9. [故障排除](#故障排除)

---

## 系统要求

### 硬件要求

#### 最低配置
- **CPU**: 2核心 2.4GHz
- **内存**: 4GB RAM
- **存储**: 20GB 可用磁盘空间
- **网络**: 100Mbps 带宽

#### 推荐配置
- **CPU**: 4核心 3.0GHz+
- **内存**: 8GB+ RAM
- **存储**: 100GB+ SSD (用于游戏文件存储)
- **网络**: 1Gbps 带宽

#### 生产环境配置
- **CPU**: 8核心 3.5GHz+
- **内存**: 16GB+ RAM
- **存储**: 500GB+ SSD + 额外存储用于游戏文件
- **网络**: 10Gbps 带宽
- **负载均衡**: 推荐使用负载均衡器

### 软件要求

#### 操作系统
- **Linux**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **Windows**: Windows Server 2019+
- **macOS**: macOS 11+ (仅用于开发环境)

#### 运行时环境
- **Node.js**: v16.0.0 或更高版本
- **npm**: v8.0.0 或更高版本 (或使用 pnpm/yarn)

#### Web服务器
- **Nginx**: v1.18+ (推荐)
- **Apache**: v2.4+ (备选)
- **IIS**: v10+ (Windows环境)

#### 可选组件
- **CDN**: CloudFlare / AWS CloudFront / 阿里云CDN
- **SSL证书**: Let's Encrypt 或商业证书
- **监控工具**: PM2 / systemd / supervisord

---

## 环境准备

### 1. 服务器准备

#### Linux (Ubuntu) 环境设置
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git unzip

# 安装 Node.js (使用 NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### 安装 Nginx
```bash
# 安装 Nginx
sudo apt install -y nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查状态
sudo systemctl status nginx
```

### 2. 用户和权限设置
```bash
# 创建专用用户
sudo useradd -m -s /bin/bash gamehub
sudo usermod -aG sudo gamehub

# 创建项目目录
sudo mkdir -p /var/www/gamehub
sudo chown gamehub:gamehub /var/www/gamehub
```

### 3. 防火墙配置
```bash
# Ubuntu UFW 配置
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable

# CentOS/RHEL firewalld 配置
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 部署步骤

### 1. 获取项目代码

#### 从 Git 仓库拉取
```bash
# 切换到项目用户
sudo su - gamehub

# 克隆项目
cd /var/www/gamehub
git clone <your-repository-url> .

# 或者从压缩包解压
# wget <project-archive-url>
# unzip project-archive.zip
```

### 2. 安装依赖
```bash
# 安装项目依赖
npm install

# 或使用 pnpm (推荐，速度更快)
npm install -g pnpm
pnpm install
```

### 3. 构建项目
```bash
# 生产环境构建
npm run build

# 验证构建结果
ls -la dist/
```

### 4. 配置环境变量
```bash
# 创建环境配置文件
cp .env.example .env.production

# 编辑生产环境配置
nano .env.production
```

#### 环境变量示例
```bash
# .env.production
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# 应用配置
APP_NAME="GameHub Pro"
APP_URL=https://yourdomain.com
ADMIN_SECRET_KEY=your-secure-secret-key

# 文件上传配置
UPLOAD_MAX_SIZE=50MB
UPLOAD_PATH=/var/www/gamehub/uploads
ALLOWED_FILE_TYPES=.zip,.html,.js

# 安全配置
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
BCRYPT_ROUNDS=12

# 日志配置
LOG_LEVEL=info
LOG_PATH=/var/log/gamehub

# CDN配置 (可选)
CDN_URL=https://cdn.yourdomain.com
```

### 5. Nginx 配置

#### 创建 Nginx 配置文件
```bash
sudo nano /etc/nginx/sites-available/gamehub
```

#### Nginx 配置内容
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL 证书配置
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 网站根目录
    root /var/www/gamehub/dist;
    index index.html;
    
    # 游戏文件和上传文件
    location /uploads/ {
        alias /var/www/gamehub/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # API 代理 (如果有后端 API)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 管理员路由支持
    location /admin {
        try_files $uri $uri/ /index.html;
    }
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 安全头配置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # 文件上传大小限制
    client_max_body_size 50M;
    
    # 访问日志
    access_log /var/log/nginx/gamehub_access.log;
    error_log /var/log/nginx/gamehub_error.log;
}
```

#### 启用站点配置
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/gamehub /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 6. SSL 证书配置

#### 使用 Let's Encrypt (推荐)
```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. 进程管理 (使用 PM2)

#### 安装 PM2
```bash
sudo npm install -g pm2
```

#### 创建 PM2 配置文件
```bash
nano ecosystem.config.js
```

#### PM2 配置内容
```javascript
module.exports = {
  apps: [{
    name: 'gamehub-pro',
    script: 'serve',
    args: '-s dist -l 3000',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/gamehub/pm2-error.log',
    out_file: '/var/log/gamehub/pm2-out.log',
    log_file: '/var/log/gamehub/pm2-combined.log',
    time: true
  }]
}
```

#### 启动应用
```bash
# 创建日志目录
sudo mkdir -p /var/log/gamehub
sudo chown gamehub:gamehub /var/log/gamehub

# 安装 serve (静态文件服务器)
npm install -g serve

# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u gamehub --hp /home/gamehub
```

---

## 配置管理

### 1. 目录结构
```
/var/www/gamehub/
├── dist/                 # 构建后的静态文件
├── uploads/              # 用户上传的游戏文件
├── config/               # 配置文件
├── logs/                 # 应用日志
├── scripts/              # 部署和维护脚本
├── .env.production       # 生产环境变量
└── ecosystem.config.js   # PM2 配置
```

### 2. 权限设置
```bash
# 设置目录权限
sudo chown -R gamehub:gamehub /var/www/gamehub
sudo chmod -R 755 /var/www/gamehub
sudo chmod -R 775 /var/www/gamehub/uploads
sudo chmod -R 755 /var/www/gamehub/dist
```

### 3. 日志配置
```bash
# 创建日志轮转配置
sudo nano /etc/logrotate.d/gamehub
```

#### 日志轮转配置
```
/var/log/gamehub/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 gamehub gamehub
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 监控与维护

### 1. 系统监控

#### PM2 监控
```bash
# 查看应用状态
pm2 status

# 查看实时日志
pm2 logs

# 查看系统资源使用
pm2 monit

# 重启应用
pm2 restart all

# 重新加载配置
pm2 reload all
```

#### 系统资源监控
```bash
# 安装系统监控工具
sudo apt install -y htop iotop nethogs

# 监控磁盘使用
df -h

# 监控内存使用
free -h

# 监控 CPU 使用
top
```

### 2. 性能监控

#### Nginx 状态监控
```bash
# 启用 Nginx 状态模块
sudo nano /etc/nginx/sites-available/gamehub

# 添加状态位置块
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

#### 应用性能监控
- 使用 New Relic、DataDog 或自建监控系统
- 配置 Prometheus + Grafana 进行详细监控
- 设置告警规则和通知机制

### 3. 健康检查脚本
```bash
# 创建健康检查脚本
nano /var/www/gamehub/scripts/health-check.sh
```

#### 健康检查脚本内容
```bash
#!/bin/bash

# 健康检查脚本
LOG_FILE="/var/log/gamehub/health-check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 检查 Nginx 状态
if ! systemctl is-active --quiet nginx; then
    echo "[$DATE] ERROR: Nginx is not running" >> $LOG_FILE
    sudo systemctl restart nginx
fi

# 检查应用状态
if ! pm2 status gamehub-pro | grep -q "online"; then
    echo "[$DATE] ERROR: GameHub Pro application is not running" >> $LOG_FILE
    pm2 restart gamehub-pro
fi

# 检查磁盘空间
DISK_USAGE=$(df /var/www/gamehub | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Disk usage is at $DISK_USAGE%" >> $LOG_FILE
fi

# 检查内存使用
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    echo "[$DATE] WARNING: Memory usage is at $MEMORY_USAGE%" >> $LOG_FILE
fi
```

#### 设置定时健康检查
```bash
# 设置执行权限
chmod +x /var/www/gamehub/scripts/health-check.sh

# 添加到 crontab
crontab -e
# 添加以下行（每5分钟执行一次）：
# */5 * * * * /var/www/gamehub/scripts/health-check.sh
```

---

## 备份策略

### 1. 数据备份
```bash
# 创建备份脚本
nano /var/www/gamehub/scripts/backup.sh
```

#### 备份脚本内容
```bash
#!/bin/bash

BACKUP_DIR="/var/backups/gamehub"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份上传的游戏文件
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /var/www/gamehub uploads/

# 备份配置文件
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" -C /var/www/gamehub .env.production ecosystem.config.js

# 备份 localStorage 数据 (如果需要)
# cp /var/www/gamehub/data/* "$BACKUP_DIR/data_$DATE/"

# 删除过期备份
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

#### 设置自动备份
```bash
# 设置执行权限
chmod +x /var/www/gamehub/scripts/backup.sh

# 添加到 crontab（每天凌晨2点执行）
crontab -e
# 添加以下行：
# 0 2 * * * /var/www/gamehub/scripts/backup.sh
```

### 2. 远程备份
```bash
# 安装 rsync
sudo apt install -y rsync

# 同步到远程服务器
rsync -avz --delete /var/backups/gamehub/ user@backup-server:/path/to/backup/
```

---

## 安全配置

### 1. 系统安全

#### 更新和补丁管理
```bash
# 设置自动安全更新
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

#### SSH 安全配置
```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config

# 推荐配置：
# Port 2222                    # 更改默认端口
# PermitRootLogin no           # 禁止 root 登录
# PasswordAuthentication no    # 禁用密码认证
# PubkeyAuthentication yes     # 启用公钥认证
# MaxAuthTries 3               # 限制认证尝试次数

# 重启 SSH 服务
sudo systemctl restart sshd
```

### 2. 应用安全

#### 文件权限安全
```bash
# 确保敏感文件权限正确
chmod 600 /var/www/gamehub/.env.production
chmod 644 /var/www/gamehub/ecosystem.config.js
```

#### 上传文件安全
- 文件类型验证
- 文件大小限制
- 病毒扫描（可选）
- 文件名清理

#### 网络安全
- WAF (Web Application Firewall)
- DDoS 防护
- IP 白名单/黑名单
- 速率限制

---

## 性能优化

### 1. Nginx 优化
```nginx
# 在 nginx.conf 中添加优化配置
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;
```

### 2. 缓存策略
```nginx
# 浏览器缓存
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API 缓存
location /api/ {
    proxy_cache_valid 200 5m;
    proxy_cache_valid 404 1m;
}
```

### 3. CDN 配置
- 静态资源使用 CDN 分发
- 图片压缩和优化
- 启用 HTTP/2
- 使用 WebP 格式图片

---

## 故障排除

### 常见问题

#### 1. 应用无法启动
```bash
# 检查应用状态
pm2 status

# 查看错误日志
pm2 logs gamehub-pro --err

# 检查端口占用
sudo netstat -tulpn | grep :3000
```

#### 2. Nginx 502 错误
```bash
# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/gamehub_error.log

# 检查应用是否运行
pm2 status

# 测试 Nginx 配置
sudo nginx -t
```

#### 3. 文件上传失败
```bash
# 检查上传目录权限
ls -la /var/www/gamehub/uploads/

# 检查磁盘空间
df -h

# 检查 Nginx 上传限制
grep client_max_body_size /etc/nginx/sites-available/gamehub
```

#### 4. 内存不足
```bash
# 查看内存使用
free -h

# 查看进程内存使用
ps aux --sort=-%mem | head

# 重启应用释放内存
pm2 restart all
```

### 紧急恢复程序

#### 完整系统恢复
1. 停止所有服务
2. 从备份恢复数据
3. 重新部署应用
4. 验证服务正常

#### 快速修复命令
```bash
# 一键重启所有服务
sudo systemctl restart nginx
pm2 restart all

# 清理日志文件
sudo truncate -s 0 /var/log/nginx/*.log
pm2 flush

# 清理临时文件
sudo rm -rf /tmp/gamehub-*
```

---

## 部署检查清单

### 部署前检查
- [ ] 服务器规格满足要求
- [ ] 域名和 DNS 配置正确
- [ ] SSL 证书准备就绪
- [ ] 备份策略已制定

### 部署过程检查
- [ ] 代码成功部署
- [ ] 依赖安装完成
- [ ] 环境变量配置正确
- [ ] Nginx 配置有效
- [ ] PM2 进程正常运行

### 部署后验证
- [ ] 网站可正常访问
- [ ] HTTPS 证书有效
- [ ] 管理员登录功能正常
- [ ] 文件上传功能正常
- [ ] 监控和日志正常

---

**文档版本**: v1.0  
**最后更新**: 2024年12月  
**维护者**: GameHub Pro DevOps 团队 