addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const { pathname } = new URL(request.url);

  // API endpoints
  if (pathname === '/api/check-cert') {
    return checkCertificates();
  }

  if (pathname === '/api/cert-details') {
    return getCertDetails(request);
  }

  // Management API endpoints
  if (pathname === '/api/monitored-domains') {
    if (request.method === 'GET') {
      return getMonitoredDomains();
    } else if (request.method === 'POST') {
      return addMonitoredDomain(request);
    }
  }

  if (pathname.startsWith('/api/monitored-domains/')) {
    const domainId = pathname.split('/')[3];
    if (request.method === 'PUT') {
      return updateMonitoredDomain(domainId, request);
    } else if (request.method === 'DELETE') {
      return deleteMonitoredDomain(domainId);
    }
  }

  if (pathname === '/api/dns-records') {
    return getDnsRecords(request);
  }

  // Web pages
  if (pathname === '/') {
    return new Response(getIndexHtml(), {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }

  if (pathname === '/admin') {
    return new Response(getAdminHtml(), {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }

  return new Response('SSL Certificate Checker API', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

function getIndexHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSL证书检测工具</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 30px;
        }
        
        .nav {
            background-color: #3498db;
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .nav ul {
            list-style-type: none;
            display: flex;
            gap: 20px;
        }
        
        .nav a {
            color: white;
            text-decoration: none;
            font-weight: bold;
        }
        
        .nav a:hover {
            text-decoration: underline;
        }
        
        .controls {
            text-align: center;
            margin-bottom: 30px;
        }
        
        button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        button:hover {
            background-color: #2980b9;
        }
        
        .status {
            margin: 20px 0;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
        }
        
        .status.success {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status.error {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .status.warning {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .cert-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .cert-card {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .cert-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .cert-type {
            font-weight: bold;
            color: #2c3e50;
        }
        
        .cert-status {
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .cert-status.valid {
            background-color: #d4edda;
            color: #155724;
        }
        
        .cert-status.warning {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .cert-status.expired {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .cert-info {
            margin-bottom: 10px;
        }
        
        .cert-info label {
            font-weight: bold;
            color: #666;
            display: block;
            margin-bottom: 5px;
        }
        
        .cert-info p {
            margin: 0;
            word-break: break-all;
        }
        
        .hostnames {
            margin-top: 10px;
        }
        
        .hostname {
            display: inline-block;
            background-color: #ecf0f1;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            margin-right: 5px;
            margin-bottom: 5px;
        }
        
        .dns-records {
            margin-top: 10px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        
        .dns-record {
            margin-bottom: 5px;
            font-size: 12px;
        }
        
        .dns-type {
            font-weight: bold;
            margin-right: 5px;
        }
        
        .dns-value {
            color: #666;
        }
        
        .node-info {
            margin-top: 10px;
            font-size: 12px;
            color: #666;
        }
        
        .details-btn {
            background-color: #95a5a6;
            color: white;
            border: none;
            padding: 5px 10px;
            font-size: 12px;
            border-radius: 3px;
            cursor: pointer;
            margin-top: 10px;
        }
        
        .details-btn:hover {
            background-color: #7f8c8d;
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
        }
        
        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .close:hover {
            color: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="nav">
            <ul>
                <li><a href="/">证书检测</a></li>
                <li><a href="/admin">管理监测地址</a></li>
            </ul>
        </div>
        <h1>SSL证书检测工具</h1>
        <div class="controls">
            <button onclick="checkCertificates()">检测证书</button>
        </div>
        <div id="status" class="status"></div>
        <div id="certList" class="cert-list"></div>
    </div>

    <div id="detailsModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>证书详情</h2>
            <div id="certDetails"></div>
        </div>
    </div>

    <script>
        async function checkCertificates() {
            const statusDiv = document.getElementById('status');
            const certListDiv = document.getElementById('certList');
            
            statusDiv.textContent = '正在检测证书...';
            statusDiv.className = 'status';
            certListDiv.innerHTML = '';
            
            try {
                const response = await fetch('/api/check-cert');
                const data = await response.json();
                
                if (data.error) {
                    statusDiv.textContent = `错误: ${data.error}`;
                    statusDiv.className = 'status error';
                    return;
                }
                
                statusDiv.textContent = `检测完成，共发现 ${data.certificates.length} 个证书`;
                statusDiv.className = 'status success';
                
                data.certificates.forEach(cert => {
                    const certCard = createCertCard(cert);
                    certListDiv.appendChild(certCard);
                });
            } catch (error) {
                statusDiv.textContent = `请求失败: ${error.message}`;
                statusDiv.className = 'status error';
            }
        }
        
        function createCertCard(cert) {
            const card = document.createElement('div');
            card.className = 'cert-card';
            
            let dnsHtml = '';
            if (cert.dns_records && cert.dns_records.length > 0) {
                dnsHtml = `
                    <div class="dns-records">
                        <strong>DNS记录:</strong>
                        ${cert.dns_records.map(record => `
                            <div class="dns-record">
                                <span class="dns-type">${record.type}:</span>
                                <span class="dns-value">${record.value}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            let nodeHtml = '';
            if (cert.node_info) {
                nodeHtml = `
                    <div class="node-info">
                        <strong>节点信息:</strong> ${cert.node_info}
                    </div>
                `;
            }
            
            card.innerHTML = `
                <div class="cert-header">
                    <span class="cert-type">${cert.type}</span>
                    <span class="cert-status ${cert.status}">${cert.status === 'valid' ? '有效' : cert.status === 'warning' ? '即将过期' : '已过期'}</span>
                </div>
                <div class="cert-info">
                    <label>剩余天数</label>
                    <p>${cert.days_left} 天</p>
                </div>
                <div class="cert-info">
                    <label>颁发日期</label>
                    <p>${new Date(cert.issued_on).toLocaleString()}</p>
                </div>
                <div class="cert-info">
                    <label>过期日期</label>
                    <p>${new Date(cert.expires_on).toLocaleString()}</p>
                </div>
                <div class="cert-info">
                    <label>颁发机构</label>
                    <p>${cert.issuer}</p>
                </div>
                <div class="cert-info">
                    <label>签名算法</label>
                    <p>${cert.signature}</p>
                </div>
                <div class="cert-info">
                    <label>域名</label>
                    <div class="hostnames">
                        ${cert.hostnames.map(hostname => `<span class="hostname">${hostname}</span>`).join('')}
                    </div>
                </div>
                ${dnsHtml}
                ${nodeHtml}
                <button class="details-btn" onclick="showCertDetails('${cert.id}')">查看详情</button>
            `;
            
            return card;
        }
        
        async function showCertDetails(certId) {
            const modal = document.getElementById('detailsModal');
            const detailsDiv = document.getElementById('certDetails');
            
            detailsDiv.innerHTML = '<p>加载中...</p>';
            modal.style.display = 'block';
            
            try {
                const response = await fetch(`/api/cert-details?id=${certId}`);
                const cert = await response.json();
                
                if (cert.error) {
                    detailsDiv.innerHTML = `<p class="status error">错误: ${cert.error}</p>`;
                    return;
                }
                
                let dnsHtml = '';
                if (cert.dns_records && cert.dns_records.length > 0) {
                    dnsHtml = `
                        <div class="cert-info">
                            <label>DNS记录</label>
                            <div class="dns-records">
                                ${cert.dns_records.map(record => `
                                    <div class="dns-record">
                                        <span class="dns-type">${record.type}:</span>
                                        <span class="dns-value">${record.value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
                
                let nodeHtml = '';
                if (cert.node_info) {
                    nodeHtml = `
                        <div class="cert-info">
                            <label>节点信息</label>
                            <p>${cert.node_info}</p>
                        </div>
                    `;
                }
                
                detailsDiv.innerHTML = `
                    <div class="cert-info">
                        <label>证书ID</label>
                        <p>${cert.id}</p>
                    </div>
                    <div class="cert-info">
                        <label>类型</label>
                        <p>${cert.type}</p>
                    </div>
                    <div class="cert-info">
                        <label>状态</label>
                        <p>${cert.status}</p>
                    </div>
                    <div class="cert-info">
                        <label>颁发日期</label>
                        <p>${new Date(cert.issued_on).toLocaleString()}</p>
                    </div>
                    <div class="cert-info">
                        <label>过期日期</label>
                        <p>${new Date(cert.expires_on).toLocaleString()}</p>
                    </div>
                    <div class="cert-info">
                        <label>颁发机构</label>
                        <p>${cert.issuer}</p>
                    </div>
                    <div class="cert-info">
                        <label>签名算法</label>
                        <p>${cert.signature}</p>
                    </div>
                    <div class="cert-info">
                        <label>域名</label>
                        <div class="hostnames">
                            ${cert.hostnames.map(hostname => `<span class="hostname">${hostname}</span>`).join('')}
                        </div>
                    </div>
                    ${dnsHtml}
                    ${nodeHtml}
                    <div class="cert-info">
                        <label>证书链</label>
                        <p>${cert.certificates.join('\n')}</p>
                    </div>
                `;
            } catch (error) {
                detailsDiv.innerHTML = `<p class="status error">请求失败: ${error.message}</p>`;
            }
        }
        
        function closeModal() {
            document.getElementById('detailsModal').style.display = 'none';
        }
        
        window.onclick = function(event) {
            const modal = document.getElementById('detailsModal');
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
        
        // 页面加载时自动检测
        window.onload = checkCertificates;
    </script>
</body>
</html>`;
}

function getAdminHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理监测地址</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .nav {
            background-color: #3498db;
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .nav ul {
            list-style-type: none;
            display: flex;
            gap: 20px;
        }
        
        .nav a {
            color: white;
            text-decoration: none;
            font-weight: bold;
        }
        
        .nav a:hover {
            text-decoration: underline;
        }
        
        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 30px;
        }
        
        .add-form {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #666;
        }
        
        .form-group input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        
        .form-row {
            display: flex;
            gap: 15px;
        }
        
        .form-row .form-group {
            flex: 1;
        }
        
        button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        button:hover {
            background-color: #2980b9;
        }
        
        button.secondary {
            background-color: #95a5a6;
        }
        
        button.secondary:hover {
            background-color: #7f8c8d;
        }
        
        button.danger {
            background-color: #e74c3c;
        }
        
        button.danger:hover {
            background-color: #c0392b;
        }
        
        .status {
            margin: 20px 0;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
        }
        
        .status.success {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status.error {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .status.warning {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .domain-list {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .domain-item {
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .domain-item:last-child {
            border-bottom: none;
        }
        
        .domain-info {
            flex: 1;
        }
        
        .domain-name {
            font-weight: bold;
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .domain-meta {
            font-size: 14px;
            color: #666;
        }
        
        .domain-actions {
            display: flex;
            gap: 10px;
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
        }
        
        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 600px;
        }
        
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .close:hover {
            color: #000;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="nav">
            <ul>
                <li><a href="/">证书检测</a></li>
                <li><a href="/admin">管理监测地址</a></li>
            </ul>
        </div>
        <h1>管理监测地址</h1>
        
        <div id="status" class="status"></div>
        
        <div class="add-form">
            <h2>添加监测地址</h2>
            <form id="addDomainForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="domain">域名</label>
                        <input type="text" id="domain" name="domain" placeholder="example.com" required>
                    </div>
                    <div class="form-group">
                        <label for="type">类型</label>
                        <input type="text" id="type" name="type" placeholder="A/CNAME" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="value">值</label>
                        <input type="text" id="value" name="value" placeholder="IP地址或域名" required>
                    </div>
                    <div class="form-group">
                        <label for="nodeInfo">节点信息</label>
                        <input type="text" id="nodeInfo" name="nodeInfo" placeholder="可选，如：北京节点">
                    </div>
                </div>
                <button type="submit">添加</button>
            </form>
        </div>
        
        <div class="domain-list">
            <div id="domainList"></div>
        </div>
    </div>

    <div id="editModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeEditModal()">&times;</span>
            <h2>编辑监测地址</h2>
            <form id="editDomainForm">
                <input type="hidden" id="editId" name="id">
                <div class="form-row">
                    <div class="form-group">
                        <label for="editDomain">域名</label>
                        <input type="text" id="editDomain" name="domain" required>
                    </div>
                    <div class="form-group">
                        <label for="editType">类型</label>
                        <input type="text" id="editType" name="type" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editValue">值</label>
                        <input type="text" id="editValue" name="value" required>
                    </div>
                    <div class="form-group">
                        <label for="editNodeInfo">节点信息</label>
                        <input type="text" id="editNodeInfo" name="nodeInfo">
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" class="secondary" onclick="closeEditModal()">取消</button>
                    <button type="submit">保存</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        let editId = null;
        
        async function loadDomains() {
            try {
                const response = await fetch('/api/monitored-domains');
                const data = await response.json();
                
                const domainList = document.getElementById('domainList');
                
                if (data.error) {
                    domainList.innerHTML = `<div style="padding: 20px; text-align: center; color: #666;">加载失败: ${data.error}</div>`;
                    return;
                }
                
                if (data.domains.length === 0) {
                    domainList.innerHTML = `<div style="padding: 20px; text-align: center; color: #666;">暂无监测地址</div>`;
                    return;
                }
                
                domainList.innerHTML = data.domains.map(domain => `
                    <div class="domain-item">
                        <div class="domain-info">
                            <div class="domain-name">${domain.domain}</div>
                            <div class="domain-meta">
                                类型: ${domain.type} | 值: ${domain.value} | 节点: ${domain.node_info || '未设置'}
                            </div>
                        </div>
                        <div class="domain-actions">
                            <button class="secondary" onclick="editDomain('${domain.id}', '${domain.domain}', '${domain.type}', '${domain.value}', '${domain.node_info || ''}')">编辑</button>
                            <button class="danger" onclick="deleteDomain('${domain.id}')">删除</button>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                document.getElementById('status').textContent = `加载失败: ${error.message}`;
                document.getElementById('status').className = 'status error';
            }
        }
        
        document.getElementById('addDomainForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const domain = {
                domain: formData.get('domain'),
                type: formData.get('type'),
                value: formData.get('value'),
                node_info: formData.get('nodeInfo')
            };
            
            try {
                const response = await fetch('/api/monitored-domains', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(domain)
                });
                
                const data = await response.json();
                
                if (data.error) {
                    document.getElementById('status').textContent = `添加失败: ${data.error}`;
                    document.getElementById('status').className = 'status error';
                    return;
                }
                
                document.getElementById('status').textContent = '添加成功';
                document.getElementById('status').className = 'status success';
                e.target.reset();
                loadDomains();
            } catch (error) {
                document.getElementById('status').textContent = `添加失败: ${error.message}`;
                document.getElementById('status').className = 'status error';
            }
        });
        
        function editDomain(id, domain, type, value, nodeInfo) {
            editId = id;
            document.getElementById('editId').value = id;
            document.getElementById('editDomain').value = domain;
            document.getElementById('editType').value = type;
            document.getElementById('editValue').value = value;
            document.getElementById('editNodeInfo').value = nodeInfo;
            document.getElementById('editModal').style.display = 'block';
        }
        
        function closeEditModal() {
            document.getElementById('editModal').style.display = 'none';
            editId = null;
        }
        
        document.getElementById('editDomainForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const domain = {
                domain: formData.get('domain'),
                type: formData.get('type'),
                value: formData.get('value'),
                node_info: formData.get('nodeInfo')
            };
            
            try {
                const response = await fetch(`/api/monitored-domains/${editId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(domain)
                });
                
                const data = await response.json();
                
                if (data.error) {
                    document.getElementById('status').textContent = `更新失败: ${data.error}`;
                    document.getElementById('status').className = 'status error';
                    return;
                }
                
                document.getElementById('status').textContent = '更新成功';
                document.getElementById('status').className = 'status success';
                closeEditModal();
                loadDomains();
            } catch (error) {
                document.getElementById('status').textContent = `更新失败: ${error.message}`;
                document.getElementById('status').className = 'status error';
            }
        });
        
        async function deleteDomain(id) {
            if (!confirm('确定要删除这个监测地址吗？')) {
                return;
            }
            
            try {
                const response = await fetch(`/api/monitored-domains/${id}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                
                if (data.error) {
                    document.getElementById('status').textContent = `删除失败: ${data.error}`;
                    document.getElementById('status').className = 'status error';
                    return;
                }
                
                document.getElementById('status').textContent = '删除成功';
                document.getElementById('status').className = 'status success';
                loadDomains();
            } catch (error) {
                document.getElementById('status').textContent = `删除失败: ${error.message}`;
                document.getElementById('status').className = 'status error';
            }
        }
        
        window.onclick = function(event) {
            const modal = document.getElementById('editModal');
            if (event.target == modal) {
                modal.style.display = 'none';
                editId = null;
            }
        }
        
        // 页面加载时加载监测地址列表
        window.onload = loadDomains;
    </script>
</body>
</html>`;
}

async function getMonitoredDomains() {
  try {
    const domains = [];
    const keys = await CERTIFICATE_DATA.list();
    
    for (const key of keys.keys) {
      if (key.name.startsWith('domain_')) {
        const domain = await CERTIFICATE_DATA.get(key.name, { type: 'json' });
        if (domain) {
          domains.push(domain);
        }
      }
    }
    
    return new Response(JSON.stringify({ domains }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function addMonitoredDomain(request) {
  try {
    const domainData = await request.json();
    
    if (!domainData.domain || !domainData.type || !domainData.value) {
      return new Response(JSON.stringify({ error: 'Domain, type, and value are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const id = `domain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const domain = {
      id: id,
      domain: domainData.domain,
      type: domainData.type,
      value: domainData.value,
      node_info: domainData.node_info || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await CERTIFICATE_DATA.put(id, JSON.stringify(domain));
    
    return new Response(JSON.stringify({ success: true, domain }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function updateMonitoredDomain(domainId, request) {
  try {
    const domainData = await request.json();
    
    if (!domainData.domain || !domainData.type || !domainData.value) {
      return new Response(JSON.stringify({ error: 'Domain, type, and value are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const existingDomain = await CERTIFICATE_DATA.get(domainId, { type: 'json' });
    if (!existingDomain) {
      return new Response(JSON.stringify({ error: 'Domain not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const updatedDomain = {
      ...existingDomain,
      domain: domainData.domain,
      type: domainData.type,
      value: domainData.value,
      node_info: domainData.node_info || '',
      updated_at: new Date().toISOString()
    };
    
    await CERTIFICATE_DATA.put(domainId, JSON.stringify(updatedDomain));
    
    return new Response(JSON.stringify({ success: true, domain: updatedDomain }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function deleteMonitoredDomain(domainId) {
  try {
    const existingDomain = await CERTIFICATE_DATA.get(domainId, { type: 'json' });
    if (!existingDomain) {
      return new Response(JSON.stringify({ error: 'Domain not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    await CERTIFICATE_DATA.delete(domainId);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function checkCertificates() {
  try {
    const apiKey = API_KEY;
    const zoneId = ZONE_ID;

    if (!apiKey || !zoneId) {
      return new Response(JSON.stringify({ error: 'API_KEY and ZONE_ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/certificates`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch certificates' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const certificates = data.result;
    
    // 获取监测的域名列表
    const monitoredDomains = [];
    const keys = await CERTIFICATE_DATA.list();
    for (const key of keys.keys) {
      if (key.name.startsWith('domain_')) {
        const domain = await CERTIFICATE_DATA.get(key.name, { type: 'json' });
        if (domain) {
          monitoredDomains.push(domain);
        }
      }
    }

    const checkResults = certificates.map(cert => {
      const now = new Date();
      const expiresOn = new Date(cert.expires_on);
      const daysLeft = Math.ceil((expiresOn - now) / (1000 * 60 * 60 * 24));
      
      let status = 'valid';
      if (daysLeft < 0) {
        status = 'expired';
      } else if (daysLeft < 30) {
        status = 'warning';
      }
      
      // 查找相关的DNS记录和节点信息
      const relatedDomains = monitoredDomains.filter(domain => 
        cert.hostnames.some(hostname => hostname === domain.domain || hostname.endsWith(`.${domain.domain}`))
      );
      
      const dns_records = relatedDomains.map(domain => ({
        type: domain.type,
        value: domain.value
      }));
      
      const node_info = relatedDomains.map(domain => domain.node_info).filter(Boolean).join(', ');

      return {
        id: cert.id,
        type: cert.type,
        hostnames: cert.hostnames,
        status: status,
        days_left: daysLeft,
        expires_on: cert.expires_on,
        issued_on: cert.issued_on,
        issuer: cert.issuer,
        signature: cert.signature,
        dns_records: dns_records,
        node_info: node_info
      };
    });

    return new Response(JSON.stringify({ certificates: checkResults }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function getDnsRecords(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    
    if (!domain) {
      return new Response(JSON.stringify({ error: 'Domain is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = API_KEY;
    const zoneId = ZONE_ID;

    if (!apiKey || !zoneId) {
      return new Response(JSON.stringify({ error: 'API_KEY and ZONE_ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 调用Cloudflare API获取DNS记录
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${encodeURIComponent(domain)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch DNS records' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const dnsRecords = data.result;
    
    // 过滤出A和CNAME记录
    const filteredRecords = dnsRecords.filter(record => 
      record.type === 'A' || record.type === 'CNAME'
    );
    
    return new Response(JSON.stringify({ records: filteredRecords }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function getCertDetails(request) {
  try {
    const { searchParams } = new URL(request.url);
    const certId = searchParams.get('id');
    
    if (!certId) {
      return new Response(JSON.stringify({ error: 'Certificate ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = API_KEY;
    const zoneId = ZONE_ID;

    if (!apiKey || !zoneId) {
      return new Response(JSON.stringify({ error: 'API_KEY and ZONE_ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/certificates/${certId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch certificate details' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const cert = data.result;
    
    // 获取监测的域名列表，用于关联DNS记录和节点信息
    const monitoredDomains = [];
    const keys = await CERTIFICATE_DATA.list();
    for (const key of keys.keys) {
      if (key.name.startsWith('domain_')) {
        const domain = await CERTIFICATE_DATA.get(key.name, { type: 'json' });
        if (domain) {
          monitoredDomains.push(domain);
        }
      }
    }
    
    // 查找相关的DNS记录和节点信息
    const relatedDomains = monitoredDomains.filter(domain => 
      cert.hostnames.some(hostname => hostname === domain.domain || hostname.endsWith(`.${domain.domain}`))
    );
    
    const dns_records = relatedDomains.map(domain => ({
      type: domain.type,
      value: domain.value
    }));
    
    const node_info = relatedDomains.map(domain => domain.node_info).filter(Boolean).join(', ');
    
    // 将DNS记录和节点信息添加到证书详情中
    cert.dns_records = dns_records;
    cert.node_info = node_info;
    
    return new Response(JSON.stringify(cert), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
