#!/usr/bin/env node

import { spawn } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BIN_DIR = path.join(process.cwd(), 'bin');

const PROVIDERS = {
  ookla: {
    name: 'Ookla Speedtest',
    binary: 'speedtest' + (process.platform === 'win32' ? '.exe' : ''),
    version: '1.2.0',
    downloadUrl: 'https://install.speedtest.net/app/cli/ookla-speedtest-1.2.0-',
    binaries: {
      'win32-x64': 'win64.zip',
      'darwin-x64': 'macosx-x86_64.tgz',
      'linux-x64': 'linux-x86_64.tgz',
      'linux-arm64': 'linux-aarch64.tgz',
      'linux-arm': 'linux-armhf.tgz',
    }
  },
  librespeed: {
    name: 'LibreSpeed',
    binary: 'librespeed-cli' + (process.platform === 'win32' ? '.exe' : ''),
    version: '1.0.10',
    downloadUrl: 'https://github.com/librespeed/speedtest-cli/releases/download/v1.0.10/librespeed-cli-1.0.10-',
    binaries: {
      'win32-x64': 'windows_amd64.zip',
      'win32-ia32': 'windows_386.zip',
      'win32-arm64': 'windows_arm64.zip',
      'darwin-x64': 'darwin_amd64.tar.gz',
      'darwin-arm64': 'darwin_arm64.tar.gz',
      'linux-x64': 'linux_amd64.tar.gz',
      'linux-arm64': 'linux_arm64.tar.gz',
      'linux-arm': 'linux_armv7.tar.gz',
    }
  },
  cloudflare: {
    name: 'Cloudflare Speedtest',
    binary: 'cfspeedtest' + (process.platform === 'win32' ? '.exe' : ''),
    version: '2.1.0',
    downloadUrl: 'https://github.com/cloudflare/cf-speedtest/releases/download/v2.1.0/',
    binaries: {
      'win32-x64': 'cfspeedtest-x86_64-pc-windows-msvc.zip',
      'darwin-x64': 'cfspeedtest-x86_64-apple-darwin.tar.gz',
      'darwin-arm64': 'cfspeedtest-aarch64-apple-darwin.tar.gz',
      'linux-x64': 'cfspeedtest-x86_64-unknown-linux-gnu.tar.gz',
      'linux-arm64': 'cfspeedtest-aarch64-unknown-linux-gnu.tar.gz',
    }
  }
};

function getNetworkInterface() {
  const interfaces = os.networkInterfaces();
  let bestInterface = null;
  let bestIP = null;

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    
    for (const addr of addrs) {
      if (addr.internal || addr.family !== 'IPv4') continue;
      
      if (!bestInterface || name.toLowerCase().includes('ethernet') || name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wlan')) {
        bestInterface = name;
        bestIP = addr.address;
      }
    }
  }

  return { interface: bestInterface, ip: bestIP };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    provider: 'ookla',
    serverId: null,
    serverUrl: null,
    interface: null,
    format: 'human',
    help: false,
    listProviders: false,
    verbose: false,
    downloadOnly: false,
    uploadOnly: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--provider':
      case '-p':
        options.provider = args[++i]?.toLowerCase() || 'ookla';
        break;
      case '--server':
      case '-s':
        options.serverId = args[++i];
        break;
      case '--url':
      case '-u':
        options.serverUrl = args[++i];
        break;
      case '--interface':
      case '-i':
        options.interface = args[++i];
        break;
      case '--format':
      case '-f':
        options.format = args[++i] || 'human';
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--list-providers':
      case '-l':
        options.listProviders = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--download':
      case '-d':
        options.downloadOnly = true;
        break;
      case '--upload':
      case '-U':
        options.uploadOnly = true;
        break;
      default:
        if (!arg.startsWith('-')) {
          options.provider = arg.toLowerCase();
        }
    }
  }

  return options;
}

function showHelp() {
  console.log(`
MySpeed CLI - 网速测试工具

用法: node cli/index.js [选项] [提供商]

选项:
  -p, --provider <name>    指定测速提供商 (默认: ookla)
                           可用: ookla, librespeed, cloudflare
  -s, --server <id>        指定服务器 ID
  -u, --url <url>          指定自定义服务器 URL (仅 librespeed)
  -i, --interface <name>   指定网络接口
  -f, --format <format>    输出格式: human, json, csv (默认: human)
  -d, --download           仅测试下载速度
  -U, --upload             仅测试上传速度
  -v, --verbose            显示详细输出
  -l, --list-providers     列出所有可用的测速提供商
  -h, --help               显示此帮助信息

示例:
  node cli/index.js                    # 使用默认提供商 (ookla)
  node cli/index.js ookla              # 使用 Ookla Speedtest
  node cli/index.js librespeed         # 使用 LibreSpeed
  node cli/index.js cloudflare         # 使用 Cloudflare Speedtest
  node cli/index.js -p ookla -s 12345 # 使用指定的 Ookla 服务器
  node cli/index.js -f json            # 以 JSON 格式输出结果
`);
}

function listProviders() {
  console.log('\n可用的测速提供商:\n');
  for (const [key, provider] of Object.entries(PROVIDERS)) {
    console.log(`  ${key.padEnd(12)} - ${provider.name}`);
  }
  console.log('');
}

function ensureBinDir() {
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
  }
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    
    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'MySpeed CLI/1.0'
      },
      followRedirect: true
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        file.close();
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`下载失败，HTTP 状态码: ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length']) || 0;
      let downloaded = 0;
      
      response.on('data', (chunk) => {
        downloaded += chunk.length;
        if (totalSize > 0) {
          const percent = Math.round((downloaded / totalSize) * 100);
          process.stdout.write(`\r下载进度: ${percent}% (${(downloaded / 1024 / 1024).toFixed(1)} MB / ${(totalSize / 1024 / 1024).toFixed(1)} MB)`);
        }
      });
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        process.stdout.write('\r' + ' '.repeat(80) + '\r');
        resolve(dest);
      });
    });
    
    request.on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('下载超时'));
    });
  });
}

async function extractArchive(archivePath, destDir, binaryName) {
  if (archivePath.endsWith('.zip')) {
    try {
      if (process.platform === 'win32') {
        execSync(`powershell -command "Expand-Archive -Path '${archivePath.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}' -Force"`, { stdio: 'ignore' });
      } else {
        execSync(`unzip -o '${archivePath}' -d '${destDir}'`, { stdio: 'ignore' });
      }
    } catch (err) {
      console.warn('系统解压工具失败，尝试使用 Node.js 解压...');
      return false;
    }
  } else if (archivePath.endsWith('.tar.gz') || archivePath.endsWith('.tgz')) {
    try {
      execSync(`tar -xzf '${archivePath}' -C '${destDir}'`, { stdio: 'ignore' });
    } catch (err) {
      console.warn('系统解压工具失败...');
      return false;
    }
  }
  
  const binaryNameNoExt = binaryName.replace('.exe', '');
  
  function searchDirectory(dir, depth = 0) {
    if (depth > 3) return null;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        const found = searchDirectory(filePath, depth + 1);
        if (found) return found;
      } else if (file === binaryName || file.toLowerCase().includes(binaryNameNoExt.toLowerCase())) {
        return filePath;
      }
    }
    return null;
  }
  
  const foundPath = searchDirectory(destDir);
  
  if (foundPath) {
    const finalPath = path.join(destDir, binaryName);
    if (foundPath !== finalPath) {
      fs.copyFileSync(foundPath, finalPath);
    }
    if (process.platform !== 'win32') {
      fs.chmodSync(finalPath, 0o755);
    }
    return true;
  }
  
  return false;
}

async function ensureBinary(provider) {
  const providerConfig = PROVIDERS[provider];
  if (!providerConfig) {
    throw new Error(`未知的测速提供商: ${provider}`);
  }

  const binaryPath = path.join(BIN_DIR, providerConfig.binary);
  
  if (fs.existsSync(binaryPath)) {
    return binaryPath;
  }

  ensureBinDir();
  
  const platformKey = `${process.platform}-${process.arch}`;
  const suffix = providerConfig.binaries[platformKey];
  
  if (!suffix) {
    throw new Error(`不支持的平台: ${platformKey}`);
  }

  console.log(`正在下载 ${providerConfig.name} 测速工具...`);
  
  let archiveUrl = providerConfig.downloadUrl + suffix;
  
  if (provider === 'librespeed') {
    archiveUrl = `https://github.com/librespeed/speedtest-cli/releases/download/v${providerConfig.version}/librespeed-cli-${providerConfig.version}-${suffix}`;
  }
  
  const archivePath = path.join(BIN_DIR, suffix);
  
  try {
    await downloadFile(archiveUrl, archivePath);
    const success = await extractArchive(archivePath, BIN_DIR, providerConfig.binary);
    
    if (fs.existsSync(archivePath)) {
      fs.unlinkSync(archivePath);
    }
    
    if (!success || !fs.existsSync(binaryPath)) {
      throw new Error('无法提取二进制文件');
    }
    
    console.log(`${providerConfig.name} 测速工具已准备就绪`);
    return binaryPath;
  } catch (error) {
    if (fs.existsSync(archivePath)) {
      fs.unlinkSync(archivePath);
    }
    throw error;
  }
}

function buildArgs(provider, options) {
  const args = [];
  const { interface: iface, serverId, serverUrl } = options;
  const netInfo = getNetworkInterface();
  const ip = iface ? null : netInfo.ip;

  switch (provider) {
    case 'ookla':
      args.push('--accept-license', '--accept-gdpr', '--format=json');
      if (ip) {
        if (process.platform === 'win32') {
          args.push(`--ip=${ip}`);
        } else {
          args.push(`--interface=${iface || netInfo.interface}`);
        }
      }
      if (serverId) args.push(`--server-id=${serverId}`);
      if (options.downloadOnly) args.push('--no-upload');
      if (options.uploadOnly) args.push('--no-download');
      break;

    case 'librespeed':
      args.push('--json', '--duration=5');
      if (ip) args.push(`--source=${ip}`);
      if (serverUrl) {
        const tempConfig = [
          {
            id: 1,
            name: 'Custom Server',
            server: serverUrl,
            dlURL: 'garbage.php',
            ulURL: 'empty.php',
            pingURL: 'empty.php',
            getIpURL: 'getIP.php'
          }
        ];
        const tempPath = path.join(BIN_DIR, 'libre_custom.json');
        fs.writeFileSync(tempPath, JSON.stringify(tempConfig));
        args.push(`--local-json=${tempPath}`);
        args.push('--server=1');
      } else if (serverId) {
        args.push(`--server=${serverId}`);
      }
      if (options.downloadOnly) args.push('--no-upload');
      if (options.uploadOnly) args.push('--no-download');
      break;

    case 'cloudflare':
      args.push('--output-format=json');
      if (ip) {
        if (ip.includes(':')) {
          args.push(`--ipv6=${ip}`);
        } else {
          args.push(`--ipv4=${ip}`);
        }
      }
      break;
  }

  return args;
}

function parseOoklaResult(data) {
  if (!data || !data.download || !data.upload) {
    return null;
  }

  const roundSpeed = (bandwidth) => Math.round(bandwidth / 1250) / 100;

  return {
    provider: 'ookla',
    ping: Math.round(data.ping?.latency || 0),
    jitter: data.ping?.jitter ? parseFloat(data.ping.jitter.toFixed(2)) : null,
    download: roundSpeed(data.download.bandwidth),
    upload: roundSpeed(data.upload.bandwidth),
    downloadBytes: data.download.bytes || 0,
    uploadBytes: data.upload.bytes || 0,
    server: data.server?.name || 'Unknown',
    serverId: data.server?.id,
    isp: data.isp || 'Unknown',
    ip: data.interface?.externalIp || 'Unknown',
    resultUrl: data.result?.url || null,
    elapsed: Math.round((data.download.elapsed + data.upload.elapsed) / 1000),
    timestamp: new Date().toISOString()
  };
}

function parseLibreResult(data) {
  if (!data) return null;

  return {
    provider: 'librespeed',
    ping: Math.round(data.ping || 0),
    jitter: data.jitter ? parseFloat(parseFloat(data.jitter).toFixed(2)) : null,
    download: data.download || 0,
    upload: data.upload || 0,
    server: data.server?.name || 'Unknown',
    serverId: data.server?.id,
    ip: data.client || 'Unknown',
    elapsed: Math.round((data.elapsed || 0) / 1000),
    timestamp: new Date().toISOString()
  };
}

function parseCloudflareResult(data) {
  if (!data || !data.latency_measurement || !data.speed_measurements) {
    return null;
  }

  const downloadTests = data.speed_measurements.filter(t => t.test_type === 'Download');
  const uploadTests = data.speed_measurements.filter(t => t.test_type === 'Upload');

  const downloadSpeeds = downloadTests.map(t => t.max || t.median || 0);
  const download = downloadSpeeds.length > 0 ? Math.max(...downloadSpeeds) : 0;

  const uploadSpeeds = uploadTests.map(t => t.max || t.median || 0);
  const upload = uploadSpeeds.length > 0 ? Math.max(...uploadSpeeds) : 0;

  const ping = Math.round(data.latency_measurement.avg_latency_ms || 0);
  
  const latencyMeasurements = data.latency_measurement.latency_measurements || [];
  let jitter = null;
  if (latencyMeasurements.length >= 2) {
    let totalDiff = 0;
    for (let i = 1; i < latencyMeasurements.length; i++) {
      totalDiff += Math.abs(latencyMeasurements[i] - latencyMeasurements[i - 1]);
    }
    jitter = parseFloat((totalDiff / (latencyMeasurements.length - 1)).toFixed(2));
  }

  return {
    provider: 'cloudflare',
    ping,
    jitter,
    download: parseFloat(download.toFixed(2)),
    upload: parseFloat(upload.toFixed(2)),
    server: 'Cloudflare',
    ip: data.selection?.address || 'Unknown',
    elapsed: Math.round((data.elapsed || 30000) / 1000),
    timestamp: new Date().toISOString()
  };
}

function parseResult(provider, data) {
  switch (provider) {
    case 'ookla':
      return parseOoklaResult(data);
    case 'librespeed':
      return parseLibreResult(data);
    case 'cloudflare':
      return parseCloudflareResult(data);
    default:
      return null;
  }
}

function formatResult(result, format) {
  if (!result) {
    return format === 'json' ? JSON.stringify({ error: '无法解析测试结果' }, null, 2) : '错误: 无法解析测试结果';
  }

  switch (format) {
    case 'json':
      return JSON.stringify(result, null, 2);
    case 'csv':
      const headers = ['provider', 'ping', 'jitter', 'download', 'upload', 'server', 'elapsed', 'timestamp'];
      const values = headers.map(h => result[h] !== undefined ? result[h] : '');
      return [headers.join(','), values.join(',')].join('\n');
    default:
      const lines = [];
      lines.push('');
      lines.push('╔══════════════════════════════════════════════════════════════╗');
      lines.push('║                    MySpeed CLI 测速结果                        ║');
      lines.push('╠══════════════════════════════════════════════════════════════╣');
      lines.push(`║  提供商:    ${PROVIDERS[result.provider]?.name || result.provider}`.padEnd(64) + '║');
      lines.push(`║  服务器:    ${result.server}`.padEnd(64) + '║');
      lines.push(`║  IP 地址:   ${result.ip}`.padEnd(64) + '║');
      lines.push('╠══════════════════════════════════════════════════════════════╣');
      lines.push('║                                                                 ║');
      lines.push(`║  延迟 (Ping):     ${result.ping} ms${result.jitter ? ` (抖动: ${result.jitter} ms)` : ''}`.padEnd(64) + '║');
      lines.push('║                                                                 ║');
      lines.push(`║  下载速度:        ${result.download.toFixed(2)} Mbps`.padEnd(64) + '║');
      lines.push('║                                                                 ║');
      lines.push(`║  上传速度:        ${result.upload.toFixed(2)} Mbps`.padEnd(64) + '║');
      lines.push('║                                                                 ║');
      lines.push('╠══════════════════════════════════════════════════════════════╣');
      lines.push(`║  耗时:      ${result.elapsed} 秒`.padEnd(64) + '║');
      lines.push(`║  时间:      ${new Date(result.timestamp).toLocaleString()}`.padEnd(64) + '║');
      if (result.resultUrl) {
        lines.push(`║  结果链接:  ${result.resultUrl}`.padEnd(64) + '║');
      }
      lines.push('╚══════════════════════════════════════════════════════════════╝');
      lines.push('');
      return lines.join('\n');
  }
}

async function runSpeedtest(provider, options) {
  const binaryPath = await ensureBinary(provider);
  const args = buildArgs(provider, options);
  
  if (options.verbose) {
    console.log(`执行命令: ${binaryPath} ${args.join(' ')}`);
  }

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let resultData = null;

    const testProcess = spawn(binaryPath, args, { 
      windowsHide: true,
      env: { ...process.env, NO_COLOR: '1' }
    });

    testProcess.stdout.on('data', (data) => {
      const str = data.toString();
      stdout += str;
      
      if (options.verbose) {
        console.log(str.trim());
      } else {
        if (provider === 'ookla') {
          const lines = str.split('\n');
          for (const line of lines) {
            try {
              if (line.trim().startsWith('{')) {
                const json = JSON.parse(line);
                if (json.type === 'ping' && json.ping) {
                  process.stdout.write(`\r正在测试延迟... ${json.ping.latency?.toFixed(1) || '...'} ms`);
                } else if (json.type === 'download' && json.download) {
                  const speed = (json.download.bandwidth / 125000).toFixed(2);
                  process.stdout.write(`\r正在测试下载... ${speed} Mbps`);
                } else if (json.type === 'upload' && json.upload) {
                  const speed = (json.upload.bandwidth / 125000).toFixed(2);
                  process.stdout.write(`\r正在测试上传... ${speed} Mbps`);
                } else if (json.type === 'result') {
                  resultData = json;
                }
              }
            } catch (e) {}
          }
        }
      }
    });

    testProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    testProcess.on('error', (err) => {
      reject(new Error(`测速进程错误: ${err.message}`));
    });

    testProcess.on('exit', (code) => {
      const elapsed = Date.now() - startTime;
      
      if (!options.verbose) {
        process.stdout.write('\r' + ' '.repeat(50) + '\r');
      }

      if (code !== 0 && stderr) {
        if (stderr.includes('Too many requests')) {
          reject(new Error('请求过于频繁，请稍后再试'));
          return;
        }
        if (stderr.includes('Configuration') && stderr.includes('error')) {
          reject(new Error('测速工具配置错误，请尝试重新下载'));
          return;
        }
      }

      try {
        let data = resultData;
        
        if (!data && stdout) {
          const lines = stdout.trim().split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
              try {
                const parsed = JSON.parse(trimmed);
                if (provider === 'cloudflare' && Array.isArray(parsed)) {
                  data = parsed;
                } else if (parsed.type === 'result' || !parsed.type) {
                  data = parsed;
                }
              } catch (e) {}
            }
          }
        }

        if (!data) {
          reject(new Error('无法获取测速结果'));
          return;
        }

        const result = parseResult(provider, data);
        if (result) {
          result.elapsed = Math.round(elapsed / 1000);
          resolve(result);
        } else {
          reject(new Error('无法解析测速结果'));
        }
      } catch (err) {
        reject(new Error(`解析结果失败: ${err.message}`));
      }
    });
  });
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (options.listProviders) {
    listProviders();
    process.exit(0);
  }

  if (!PROVIDERS[options.provider]) {
    console.error(`错误: 未知的测速提供商 '${options.provider}'`);
    console.error('使用 --list-providers 查看可用的提供商');
    process.exit(1);
  }

  if (options.verbose) {
    console.log(`使用提供商: ${PROVIDERS[options.provider].name}`);
    const netInfo = getNetworkInterface();
    console.log(`网络接口: ${netInfo.interface} (${netInfo.ip})`);
  }

  try {
    const result = await runSpeedtest(options.provider, options);
    console.log(formatResult(result, options.format));
    process.exit(0);
  } catch (err) {
    console.error(`\n错误: ${err.message}`);
    if (options.verbose) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();
