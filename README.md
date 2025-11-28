# SSL证书检测工具

基于Cloudflare Workers实现的在线CDN源站和节点SSL证书检测项目。

## 功能特性

- 自动检测Cloudflare账户下的所有SSL证书
- 实时显示证书状态（有效、即将过期、已过期）
- 显示证书剩余天数、颁发者、签名算法等详细信息
- 支持查看单个证书的完整详情
- 响应式设计，适配各种设备

## 技术栈

- Cloudflare Workers
- JavaScript
- HTML/CSS

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/ssl-cert-checker.git
cd ssl-cert-checker
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置Cloudflare凭证

编辑 `wrangler.toml` 文件，添加你的Cloudflare API密钥和Zone ID：

```toml
[vars]
API_KEY = "your_cloudflare_api_key"
ZONE_ID = "your_cloudflare_zone_id"
```

### 4. 本地测试

```bash
npx wrangler dev
```

访问 `http://localhost:8787` 查看效果。

### 5. 部署到Cloudflare

```bash
npx wrangler deploy
```

## API端点

### GET /api/check-cert

获取所有证书的检测结果。

**响应示例：**
```json
{
  "certificates": [
    {
      "id": "cert_123456",
      "type": "dv",
      "hostnames": ["example.com", "www.example.com"],
      "status": "valid",
      "days_left": 120,
      "expires_on": "2024-12-31T23:59:59Z",
      "issued_on": "2023-12-31T00:00:00Z",
      "issuer": "Cloudflare, Inc.",
      "signature": "SHA256WithRSAEncryption"
    }
  ]
}
```

### GET /api/cert-details?id=cert_123456

获取单个证书的详细信息。

**响应示例：**
```json
{
  "id": "cert_123456",
  "type": "dv",
  "status": "active",
  "hostnames": ["example.com", "www.example.com"],
  "issuer": "Cloudflare, Inc.",
  "signature": "SHA256WithRSAEncryption",
  "issued_on": "2023-12-31T00:00:00Z",
  "expires_on": "2024-12-31T23:59:59Z",
  "certificates": ["-----BEGIN CERTIFICATE-----..."]
}
```

## 证书状态说明

- **valid**: 证书有效，剩余天数大于30天
- **warning**: 证书即将过期，剩余天数小于30天
- **expired**: 证书已过期

## 配置说明

### Cloudflare API密钥

你需要创建一个具有以下权限的Cloudflare API密钥：
- Zone.Zone Settings
- Zone.SSL and Certificates

### Zone ID

每个Cloudflare域名都有一个唯一的Zone ID，可以在域名仪表盘的右下角找到。

### 管理后台密码

默认情况下，管理后台的登录密码为 `admin`。你可以通过以下方式修改：

1. **通过wrangler.toml配置**：
   ```toml
   [vars]
   PASSWD = "your_custom_password"
   ```

2. **通过Cloudflare控制台配置**：
   - 登录Cloudflare控制台
   - 导航到Workers & Pages
   - 选择你的Worker
   - 在"设置" > "环境变量"中添加 `PASSWD` 变量

### 登录流程

1. 访问 `/admin` 路径
2. 系统会自动跳转到登录页面 `/admin/login`
3. 输入配置的密码
4. 登录成功后会自动跳回 `/admin` 页面
5. 点击导航栏的"登出"按钮可退出登录

### 保护的路由

- `/admin` - 管理后台页面
- `/api/monitored-domains` - 管理监测地址的API端点
- `/api/monitored-domains/*` - 单个监测地址的API端点

## 部署说明

### 使用Wrangler CLI部署

```bash
npx wrangler login
npx wrangler deploy
```

### 手动部署

1. 登录Cloudflare控制台
2. 导航到Workers & Pages
3. 创建一个新的Worker
4. 将 `src/worker.js` 的内容复制到Worker编辑器中
5. 在设置中添加环境变量：
   - API_KEY: 你的Cloudflare API密钥
   - ZONE_ID: 你的Cloudflare Zone ID
6. 部署Worker

## 注意事项

1. 确保你的API密钥具有足够的权限
2. 定期更新API密钥以保证安全性
3. 建议设置Worker的路由规则，只允许特定IP访问
4. 可以使用Cloudflare Workers KV存储证书历史数据

## 许可证

MIT License
