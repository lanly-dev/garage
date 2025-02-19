const simpleGit = require('simple-git')
const fs = require('fs')
const path = require('path')

// Configuration
const commitMessage = 'Update high score'
const repoUrl = 'https://github.com/lanly-dev/test-submit.git' // Replace with the actual repository URL
const repoName = path.basename(repoUrl, '.git') // Extract the repository name from the URL

// Initialize simple-git
const git = simpleGit()

// Function to check if directory is a Git repository
async function isGitRepo(directory) {
  const repoGit = simpleGit(directory);
  try {
    await repoGit.status();
    return true;
  } catch (error) {
    return false;
  }
}

// Function to create a directory if it doesn't exist
function createDirectoryIfNotExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Directory ${directory} created.`);
  } else {
    console.log(`Directory ${directory} already exists.`);
  }
}

// Function to clone the target repository into a subdirectory
async function cloneRepo() {
  try {
    // Check if the subdirectory already exists
    if (fs.existsSync(repoName)) {
      console.log(`Subdirectory ${repoName} already exists. Skipping clone.`);
      return;
    }

    await git.clone(repoUrl, repoName)
    console.log('Repository cloned successfully.')
  } catch (error) {
    console.error('Error cloning repository:', error)
    if (error.message.includes('repository not found')) {
      console.error('Please check if the repository URL is correct.')
    }
  }
}

// Function to update high score
async function updateHighScore(newScore) {
  try {
    await cloneRepo();
    // Change to the subdirectory
    const repoGit = simpleGit(repoName);

    // Write new high score to file
    try {
      fs.writeFileSync(`${repoName}/highscore.txt`, `High Score: ${newScore}`, 'utf8')
    } catch (writeError) {
      console.error('Error writing high score to file:', writeError);
      return;
    }

    // Add changes to git
    await repoGit.add('highscore.txt')

    // Commit changes
    await repoGit.commit(commitMessage)

    // Push changes
    await repoGit.push()

    console.log('High score updated and changes committed.')
  } catch (error) {
    console.error('Error updating high score:', error)
  }
}

// Example usage
const newScore = 12345; // Replace with the actual high score
updateHighScore(newScore);
