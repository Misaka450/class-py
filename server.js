const http = require('http');
const fs = require('fs');
const path = require('path');

// 创建服务器
const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 获取请求路径（去除查询参数）
    let filePath = req.url.split('?')[0];
    
    // 添加调试信息
    console.log(`Request URL: ${req.url}`);
    console.log(`File path after removing query params: ${filePath}`);
    
    // 如果是根路径，返回index.html
    if (filePath === '/' || filePath === '/index.html') {
        filePath = './dist/index.html';
        console.log(`Serving index.html: ${filePath}`);
    } else {
        // 处理静态资源路径
        // 特别处理CSS和JS文件
        if (filePath === '/styles.css') {
            filePath = './dist/styles.css';
        } else if (filePath === '/app.js') {
            filePath = './dist/app.js';
        } else {
            // 其他静态资源路径处理
            if (!filePath.startsWith('/dist/')) {
                // 如果不是/dist/路径，则添加/dist/前缀
                filePath = '/dist' + filePath;
            }
            filePath = '.' + filePath;
        }
        console.log(`Serving static file: ${filePath}`);
    }
    
    // 获取文件扩展名
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // 读取文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            console.log(`File read error for ${filePath}:`, error);
            if (error.code === 'ENOENT') {
                // 文件未找到，返回404
                console.log(`404 Not Found: ${filePath}`);
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                // 其他服务器错误
                console.log(`500 Server Error: ${error.code}`);
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code);
            }
        } else {
            // 成功读取文件
            console.log(`200 OK: ${filePath}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// 启动服务器
const PORT = process.env.PORT || 3012;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to view the application`);
});