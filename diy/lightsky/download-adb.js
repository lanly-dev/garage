const https = require('https')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { exec } = require('child_process')

const execPromise = promisify(exec)

// Official ADB platform-tools download URLs
const ADB_URLS = {
  win32: 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip',
  darwin: 'https://dl.google.com/android/repository/platform-tools-latest-darwin.zip',
  linux: 'https://dl.google.com/android/repository/platform-tools-latest-linux.zip'
}

async function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination)
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close()
        fs.unlinkSync(destination)
        return downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject)
      }
      
      if (response.statusCode !== 200) {
        file.close()
        fs.unlinkSync(destination)
        return reject(new Error(`Failed to download: ${response.statusCode}`))
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10)
      let downloadedSize = 0
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length
        const progress = ((downloadedSize / totalSize) * 100).toFixed(2)
        process.stdout.write(`\rDownloading: ${progress}% (${(downloadedSize / 1024 / 1024).toFixed(2)} MB / ${(totalSize / 1024 / 1024).toFixed(2)} MB)`)
      })
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close()
        console.log('\n✓ Download complete!')
        resolve()
      })
    }).on('error', (err) => {
      file.close()
      fs.unlinkSync(destination)
      reject(err)
    });
  });
}

async function unzipFile(zipPath, outputDir) {
  console.log(`\nExtracting to: ${outputDir}`)
  
  const platform = process.platform
  
  try {
    if (platform === 'win32') {
      // Windows: Use PowerShell Expand-Archive
      await execPromise(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outputDir}' -Force"`)
    } else {
      // macOS/Linux: Use unzip
      await execPromise(`unzip -q -o "${zipPath}" -d "${outputDir}"`)
    }
    console.log('✓ Extraction complete!')
  } catch (error) {
    console.error(`✗ Error extracting file: ${error.message}`)
    throw error
  }
}

async function downloadADB() {
  const platform = process.platform
  const url = ADB_URLS[platform]
  
  if (!url) {
    console.error(`Unsupported platform: ${platform}`)
    process.exit(1)
  }
  
  const downloadDir = path.join(__dirname, 'adb-tools')
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true })
  }
  
  const zipFileName = path.basename(url)
  const outputPath = path.join(downloadDir, zipFileName)
  
  const sdkDir = path.join(__dirname, 'sdk')
  if (!fs.existsSync(sdkDir)) {
    fs.mkdirSync(sdkDir, { recursive: true })
  }
  
  console.log(`Platform: ${platform}`)
  console.log(`Downloading ADB platform-tools from: ${url}`)
  console.log(`Saving to: ${outputPath}\n`)
  
  try {
    await downloadFile(url, outputPath)
    console.log(`\nADB platform-tools downloaded successfully!`)
    console.log(`Location: ${outputPath}`)
    
    // Extract to sdk folder
    await unzipFile(outputPath, sdkDir)
    
    console.log(`\n✓ Setup complete!`)
    console.log(`ADB tools extracted to: ${sdkDir}`)
    console.log(`\nTo use ADB, add to PATH or run from: ${path.join(sdkDir, 'platform-tools')}`)
  } catch (error) {
    console.error(`\n✗ Error: ${error.message}`)
    process.exit(1)
  }
}

// Run the download
downloadADB()
