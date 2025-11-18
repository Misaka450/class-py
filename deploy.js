const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function deploy() {
  try {
    console.log('开始部署到 Cloudflare Workers...');
    
    // 运行 wrangler deploy 命令
    const { stdout, stderr } = await execAsync('npx wrangler deploy', {
      cwd: process.cwd(),
      timeout: 300000 // 5分钟超时
    });
    
    console.log('部署输出:', stdout);
    if (stderr) {
      console.error('部署错误:', stderr);
    }
    
    console.log('部署完成!');
  } catch (error) {
    console.error('部署失败:', error.message);
    if (error.stdout) console.log('stdout:', error.stdout);
    if (error.stderr) console.log('stderr:', error.stderr);
  }
}

deploy();