#!/usr/bin/env node

/**
 * GitHub 存储功能本地测试脚本
 * 使用方式：node test-github-local.js
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// GitHub 配置
const GITHUB_CONFIG = {
    API_BASE_URL: 'https://api.github.com',
    API_VERSION: '2022-11-28'
};

// 从环境变量或用户输入获取配置
function getConfig() {
    // 尝试从 .env 文件读取
    const envPath = '.env';
    let token = '', owner = '', repo = 'gamehub-storage-test';
    
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const tokenMatch = envContent.match(/VITE_GITHUB_TOKEN\s*=\s*(.+)/);
        const ownerMatch = envContent.match(/VITE_GITHUB_OWNER\s*=\s*(.+)/);
        const repoMatch = envContent.match(/VITE_GITHUB_STORAGE_REPO\s*=\s*(.+)/);
        
        if (tokenMatch) token = tokenMatch[1].trim();
        if (ownerMatch) owner = ownerMatch[1].trim();
        if (repoMatch) repo = repoMatch[1].trim();
    }
    
    return { token, owner, repo };
}

// API 请求封装
async function githubRequest(endpoint, options = {}) {
    const { token } = getConfig();
    
    const response = await fetch(`${GITHUB_CONFIG.API_BASE_URL}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': GITHUB_CONFIG.API_VERSION,
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    
    const data = await response.json();
    return { response, data };
}

// 测试1: 验证API连接
async function testAPIConnection() {
    console.log('🔗 测试1: GitHub API 连接...');
    
    try {
        const { response, data } = await githubRequest('/user');
        
        if (response.ok) {
            console.log('✅ API连接成功!');
            console.log(`   用户: ${data.login}`);
            console.log(`   邮箱: ${data.email || '未公开'}`);
            console.log(`   API限制: ${response.headers.get('x-ratelimit-remaining')}/${response.headers.get('x-ratelimit-limit')}`);
            return true;
        } else {
            console.log('❌ API连接失败:', data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ 网络错误:', error.message);
        return false;
    }
}

// 测试2: 检查存储仓库
async function testRepository() {
    console.log('\n📦 测试2: 存储仓库检查...');
    
    const { owner, repo } = getConfig();
    
    try {
        const { response, data } = await githubRequest(`/repos/${owner}/${repo}`);
        
        if (response.ok) {
            console.log('✅ 仓库存在!');
            console.log(`   仓库: ${data.full_name}`);
            console.log(`   可见性: ${data.private ? '私有' : '公开'}`);
            console.log(`   默认分支: ${data.default_branch}`);
            return true;
        } else if (response.status === 404) {
            console.log('⚠️  仓库不存在，将尝试创建...');
            return await createTestRepository();
        } else {
            console.log('❌ 仓库检查失败:', data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ 网络错误:', error.message);
        return false;
    }
}

// 创建测试仓库
async function createTestRepository() {
    console.log('🏗️  创建测试仓库...');
    
    const { repo } = getConfig();
    
    try {
        const { response, data } = await githubRequest('/user/repos', {
            method: 'POST',
            body: JSON.stringify({
                name: repo,
                description: 'GameHub Pro - Test Storage Repository',
                private: false,
                auto_init: true
            })
        });
        
        if (response.ok) {
            console.log('✅ 测试仓库创建成功!');
            console.log(`   URL: ${data.html_url}`);
            return true;
        } else {
            if (data.message.includes('already exists')) {
                console.log('⚠️  仓库已存在');
                return true;
            } else {
                console.log('❌ 仓库创建失败:', data.message);
                return false;
            }
        }
    } catch (error) {
        console.log('❌ 网络错误:', error.message);
        return false;
    }
}

// 测试3: 文件上传
async function testFileUpload() {
    console.log('\n📄 测试3: 文件上传...');
    
    const { owner, repo } = getConfig();
    
    // 创建测试文件内容
    const testContent = `<!DOCTYPE html>
<html>
<head>
    <title>GitHub Storage Test</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .success { color: #28a745; }
    </style>
</head>
<body>
    <h1 class="success">🎉 GitHub Storage Test Success!</h1>
    <p>上传时间: ${new Date().toISOString()}</p>
    <p>这是GameHub Pro的GitHub存储功能测试文件。</p>
</body>
</html>`;
    
    const base64Content = Buffer.from(testContent).toString('base64');
    
    try {
        const { response, data } = await githubRequest(
            `/repos/${owner}/${repo}/contents/test/index.html`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    message: 'GameHub Pro - Test file upload',
                    content: base64Content,
                    branch: 'main'
                })
            }
        );
        
        if (response.ok) {
            console.log('✅ 文件上传成功!');
            console.log(`   文件路径: ${data.content.path}`);
            console.log(`   GitHub URL: ${data.content.html_url}`);
            console.log(`   下载URL: ${data.content.download_url}`);
            return true;
        } else {
            console.log('❌ 文件上传失败:', data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ 网络错误:', error.message);
        return false;
    }
}

// 测试4: GitHub Pages
async function testGitHubPages() {
    console.log('\n🌐 测试4: GitHub Pages...');
    
    const { owner, repo } = getConfig();
    
    try {
        // 检查 Pages 状态
        const { response, data } = await githubRequest(`/repos/${owner}/${repo}/pages`);
        
        if (response.ok) {
            console.log('✅ GitHub Pages 已启用!');
            console.log(`   Pages URL: ${data.html_url}`);
            console.log(`   状态: ${data.status}`);
            console.log(`   测试页面: ${data.html_url}test/`);
            return true;
        } else if (response.status === 404) {
            console.log('⚠️  GitHub Pages 未启用，尝试启用...');
            return await enableGitHubPages();
        } else {
            console.log('❌ Pages 检查失败:', data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ 网络错误:', error.message);
        return false;
    }
}

// 启用 GitHub Pages
async function enableGitHubPages() {
    const { owner, repo } = getConfig();
    
    try {
        const { response, data } = await githubRequest(`/repos/${owner}/${repo}/pages`, {
            method: 'POST',
            body: JSON.stringify({
                source: {
                    branch: 'main',
                    path: '/'
                }
            })
        });
        
        if (response.ok) {
            console.log('✅ GitHub Pages 启用成功!');
            console.log(`   Pages URL: ${data.html_url}`);
            console.log('   注意: 页面构建可能需要几分钟时间');
            return true;
        } else {
            console.log('❌ Pages 启用失败:', data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ 网络错误:', error.message);
        return false;
    }
}

// 主测试函数
async function runTests() {
    console.log('🚀 GameHub Pro - GitHub 存储功能测试\n');
    
    const config = getConfig();
    
    if (!config.token) {
        console.log('❌ 缺少 GitHub Token!');
        console.log('请在 .env 文件中设置 VITE_GITHUB_TOKEN');
        console.log('或者在终端中运行: export VITE_GITHUB_TOKEN=your_token');
        process.exit(1);
    }
    
    if (!config.owner) {
        console.log('❌ 缺少 GitHub 用户名!');
        console.log('请在 .env 文件中设置 VITE_GITHUB_OWNER');
        process.exit(1);
    }
    
    console.log(`配置信息:`);
    console.log(`  用户: ${config.owner}`);
    console.log(`  仓库: ${config.repo}`);
    console.log(`  Token: ${config.token.substring(0, 8)}...`);
    
    const results = [];
    
    // 执行所有测试
    results.push(await testAPIConnection());
    results.push(await testRepository());
    results.push(await testFileUpload());
    results.push(await testGitHubPages());
    
    // 测试结果汇总
    console.log('\n📊 测试结果汇总:');
    const passedTests = results.filter(Boolean).length;
    const totalTests = results.length;
    
    console.log(`通过: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log('🎉 所有测试通过! GitHub 存储功能正常工作!');
        console.log('\n🎮 您现在可以在 GameHub Pro 中使用 GitHub 存储功能了!');
    } else {
        console.log('⚠️  部分测试失败，请检查上述错误信息。');
    }
}

// 错误处理
process.on('uncaughtException', (error) => {
    console.log('❌ 未捕获的错误:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.log('❌ 未处理的Promise拒绝:', error.message);
    process.exit(1);
});

// 执行测试
runTests(); 