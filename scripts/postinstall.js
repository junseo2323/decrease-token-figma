const { execSync } = require('child_process');
const os = require('os');

function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (err) {
    return false;
  }
}

function checkOllamaInstalled() {
  try {
    execSync('ollama --version', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log('⏳ Checking Ollama installation...');

  if (checkOllamaInstalled()) {
    console.log('✅ Ollama is already installed.');
  } else {
    console.log('❌ Ollama is not installed. Attempting to install...');
    
    const platform = os.platform();
    if (platform === 'darwin') {
      console.log('💻 macOS detected. Installing Ollama via Homebrew...');
      const success = runCommand('brew install --cask ollama');
      if (!success) {
        console.error('⚠️ Failed to install Ollama via Homebrew. Please install it manually from https://ollama.ai/download');
        process.exit(0); // Continue installation even if Ollama fails
      }
    } else if (platform === 'linux') {
      console.log('🐧 Linux detected. Installing Ollama via official script...');
      const success = runCommand('curl -fsSL https://ollama.com/install.sh | sh');
      if (!success) {
        console.error('⚠️ Failed to install Ollama. Please install it manually from https://ollama.com/download');
        process.exit(0);
      }
    } else {
      console.error(`⚠️ Unsupported OS (${platform}) for auto-installation. Please install Ollama manually from https://ollama.com/download`);
      process.exit(0);
    }
  }

  // Ensure Ollama server is running (mostly for macOS/Linux)
  console.log('🔄 Starting Ollama server in the background...');
  try {
      execSync('ollama serve > /dev/null 2>&1 &', { stdio: 'ignore' });
      // Give it a second to start
      execSync('sleep 2');
  } catch(e) {
      // It might already be running, ignore errors
  }

  console.log('📥 Pulling the llama3.2 model (this may take a few minutes)...');
  const pullSuccess = runCommand('ollama pull llama3.2');
  
  if (pullSuccess) {
    console.log('🎉 llama3.2 model is ready!');
  } else {
    console.error('⚠️ Failed to pull llama3.2 model. You may need to run `ollama pull llama3.2` manually later.');
  }
}

main();
