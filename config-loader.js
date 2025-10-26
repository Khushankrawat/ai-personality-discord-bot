const fs = require('fs');
const path = require('path');

// Load configuration from files
function loadConfiguration() {
    const configPath = path.join(__dirname, 'friends_data', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    const activeFriend = config.activeFriend;
    const friendDataPath = path.join(__dirname, 'friends_data', `${activeFriend}.json`);
    
    if (!fs.existsSync(friendDataPath)) {
        throw new Error(`Friend data file not found: ${friendDataPath}. Please create a personality file for your friend.`);
    }
    
    const friendData = JSON.parse(fs.readFileSync(friendDataPath, 'utf8'));
    
    return {
        botName: config.botName || friendData.name,
        botDescription: config.botDescription,
        personality: friendData
    };
}

module.exports = { loadConfiguration };

