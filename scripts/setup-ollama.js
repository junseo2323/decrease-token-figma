const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const modelName = process.env.FIGMA_BRIDGE_OLLAMA_MODEL || 'llama3.2';

function candidates(name) {
  const pathItems = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  const binaryName = process.platform === 'win32' ? `${name}.exe` : name;
  return [
    process.env.OLLAMA_BIN,
    ...pathItems.map(dir => path.join(dir, binaryName)),
    '/opt/homebrew/bin/ollama',
    '/usr/local/bin/ollama',
    '/usr/bin/ollama',
    '/Applications/Ollama.app/Contents/Resources/ollama',
    'C:\\Program Files\\Ollama\\ollama.exe',
  ].filter(Boolean);
}

function findExecutable(name) {
  for (const candidate of candidates(name)) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'inherit', 'inherit'],
      shell: options.shell || false,
    });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function installOllama() {
  const platform = os.platform();

  if (platform === 'darwin') {
    const brew = findExecutable('brew');
    if (!brew) throw new Error('macOS auto-install requires Homebrew.');
    try {
      await run(brew, ['install', 'ollama']);
    } catch {
      await run(brew, ['install', '--cask', 'ollama']);
    }
    return;
  }

  if (platform === 'linux') {
    await run('curl -fsSL https://ollama.com/install.sh | sh', [], { shell: true });
    return;
  }

  if (platform === 'win32') {
    const winget = findExecutable('winget');
    if (!winget) throw new Error('Windows auto-install requires winget.');
    await run(winget, ['install', '--id', 'Ollama.Ollama', '-e', '--accept-source-agreements', '--accept-package-agreements']);
    return;
  }

  throw new Error(`${platform} is not supported for automatic Ollama installation.`);
}

async function isRunning() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function startServer(ollama) {
  if (await isRunning()) {
    console.log('Ollama server is already running.');
    return;
  }

  const child = spawn(ollama, ['serve'], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();

  for (let i = 0; i < 60; i++) {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (await isRunning()) return;
  }
  throw new Error('Ollama server did not become ready within 30 seconds.');
}

async function ensureModel(ollama) {
  const response = await fetch('http://localhost:11434/api/tags');
  const data = await response.json();
  const hasModel = (data.models || []).some(model => model.name === modelName || model.name.startsWith(`${modelName}:`));
  if (hasModel) {
    console.log(`${modelName} model is ready.`);
    return;
  }

  await run(ollama, ['pull', modelName]);
}

async function main() {
  let ollama = findExecutable('ollama');
  if (!ollama) {
    console.log('Ollama is not installed. Installing...');
    await installOllama();
    ollama = findExecutable('ollama');
  }

  if (!ollama) throw new Error('Ollama was installed, but the executable was not found. Set OLLAMA_BIN.');

  console.log(`Using Ollama: ${ollama}`);
  await startServer(ollama);
  await ensureModel(ollama);
  console.log('Ollama setup complete.');
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
