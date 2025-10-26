# Complete Setup Guide 

This guide will help you set up your AI Friend Discord Bot from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Discord Bot Setup](#discord-bot-setup)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [AI Setup (Optional)](#ai-setup-optional)
6. [Running the Bot](#running-the-bot)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you start, you'll need:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Discord Account** - Free
- **Text Editor** - VS Code, Sublime, etc.
- **(Optional) Ollama** - For free local AI - [Download here](https://ollama.ai/)
- **(Optional) OpenAI Account** - For cloud AI - [Sign up here](https://platform.openai.com/)

## Discord Bot Setup

### Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Give it a name (e.g., "My Friend Bot")
4. Click **"Create"**

### Step 2: Configure the Bot

1. In the left sidebar, click **"Bot"**
2. Click **"Add Bot"** and confirm
3. Under **"Privileged Gateway Intents"**, enable:
   -  **Message Content Intent** (required for reading messages)
   -  **Server Members Intent** (optional, for user detection)
4. Save your changes

### Step 3: Get Your Bot Token

1. Still in the **"Bot"** section
2. Click **"Reset Token"** (if this is your first time, you'll see the token directly)
3. **COPY THE TOKEN** - You'll need this for your `.env` file
4.  **Keep this secret!** Don't share it publicly

### Step 4: Invite Bot to Your Server

1. Go to **"OAuth2" > "URL Generator"** in the left sidebar
2. Under **"Scopes"**, select:
   -  `bot`
   -  `applications.commands`
3. Under **"Bot Permissions"**, select:
   -  Send Messages
   -  Use Slash Commands
   -  Read Message History
   -  Add Reactions
   -  Embed Links
4. **Copy the generated URL** at the bottom
5. Open the URL in your browser
6. Select your Discord server
7. Click **"Authorize"**

## Installation

### Step 1: Clone or Download

```bash
# If using git
git clone https://github.com/yourusername/ai-friend-discord-bot.git
cd ai-friend-discord-bot

# Or download and extract the ZIP file
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages (discord.js, openai, ollama, etc.)

### Step 3: Set Up Environment Variables

```bash
# Copy the example file
cp env.example .env

# Edit the file (use nano, vim, or VS Code)
nano .env
```

Add your Discord bot token:
```env
DISCORD_TOKEN=your_bot_token_from_step_3
OPENAI_API_KEY=your_openai_key_optional
```

Save and close the file.

### Step 4: Configure Your Friend's Personality

1. Edit `friends_data/config.json`:
```json
{
  "activeFriend": "example",
  "botName": "My Friend Bot"
}
```

2. Edit or create a personality file in `friends_data/`:
```bash
# Use the existing example
cp friends_data/example.json friends_data/myfriend.json
nano friends_data/myfriend.json
```

Update the JSON with your friend's personality data (see example in `template.json`)

## Configuration

### Basic Configuration (`friends_data/config.json`)

```json
{
  "activeFriend": "example",      // Name of your friend's JSON file (without .json)
  "botName": "FriendBot"          // Display name for the bot
}
```

### Personality File Structure

Each friend's personality is defined in `friends_data/[name].json`:

**Required Fields:**
- `name` - Your friend's name
- `catchphrases` - Array of things they say
- `interests` - Array of their hobbies/interests
- `systemPrompt` - How the AI should act like them

**Optional Fields:**
- `responses` - Topic-specific responses
- `randomThoughts` - Things they might say randomly
- `personalityTraits` - How they express different emotions
- `backstory` - Background information
- `language` - "english", "hinglish", etc.

**The `systemPrompt` is critical!** It teaches the AI how to behave. Example:

```json
{
  "systemPrompt": "You are [Name], a [description]. You [personality traits]. You speak [style description]. You [behavior patterns]. Use these catchphrases: [list]. Keep responses [length]. Be [tone/energy]."
}
```

## AI Setup (Optional)

### Option 1: OpenAI (Recommended for Beginners)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to **"API Keys"**
4. Click **"Create new secret key"**
5. Copy the key
6. Add to `.env`:
```
OPENAI_API_KEY=sk-...
```

**Cost:** Pay-per-use (~$0.002 per 1K tokens)

### Option 2: Ollama (Free, Requires Local Setup)

1. Download from [ollama.ai](https://ollama.ai/)
2. Install and run:
```bash
ollama serve
```

3. Pull the model:
```bash
ollama pull llama2
# or
ollama pull mixtral
```

4. The bot will automatically use Ollama if OpenAI is not configured

**Cost:** Free, runs locally

### Option 3: No AI (Fallback Mode)

The bot works without AI using predefined responses from your personality file!

## Running the Bot

### Development Mode (Auto-restart on changes)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Verify It's Working

1. Check console for: `[BotName] Bot is ready! Logged in as YourBot#1234`
2. Go to your Discord server
3. Send a message: `@YourBot hello`
4. Bot should respond!

## Troubleshooting

### Bot Not Responding?

1.  Check bot token in `.env` is correct
2.  Verify bot has proper permissions in server
3.  Ensure "Message Content Intent" is enabled
4.  Check bot is online in server member list
5.  Look for errors in console

### "Failed to load configuration" Error

```
Error: Friend data file not found
```

**Solution:**
- Ensure `friends_data/example.json` or your custom file exists
- Check `friends_data/config.json` has correct `activeFriend` value
- Verify JSON files are valid (use a JSON validator)

### AI Not Working?

**OpenAI Errors:**
- Check API key is correct
- Verify you have credits: https://platform.openai.com/usage
- Check rate limits

**Ollama Errors:**
- Ensure Ollama is running: `ollama serve`
- Check model is downloaded: `ollama list`
- Verify connection to localhost:11434

**No AI:**
- Bot will use fallback responses (defined in personality JSON)
- This is fine! The bot still works

### Slash Commands Not Showing?

- Wait a few minutes (Discord needs time to sync)
- Re-invite bot with `applications.commands` scope
- Use `/personality` command for testing

### Bot Goes Offline?

- If running locally, bot stops when you close terminal
- Deploy to a cloud service for 24/7 uptime (see below)

### TypeError: Cannot read property 'name' of undefined

**Solution:**
- Check your `friends_data/[name].json` has all required fields
- Verify JSON is valid syntax
- Compare with `template.json`

## Deployment (Optional)

For 24/7 hosting, consider:

### Railway (Easy, Free Tier)
1. Push code to GitHub
2. Go to [railway.app](https://railway.app/)
3. New Project > Deploy from GitHub
4. Add environment variables in Railway dashboard
5. Deploy!

### Render (Free Tier)
1. Create account at [render.com](https://render.com/)
2. New Web Service
3. Connect GitHub repo
4. Set environment variables
5. Deploy!

### DigitalOcean ($5/month)
```bash
# SSH into your droplet
ssh root@your_droplet_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Clone your repo
git clone https://github.com/yourusername/ai-friend-discord-bot.git
cd ai-friend-discord-bot
npm install

# Create .env file
nano .env  # Add your tokens

# Run with PM2 (keeps bot running)
npm install -g pm2
pm2 start index.js
pm2 save
pm2 startup  # Auto-start on reboot
```

## Next Steps

-  Customize your friend's personality in `friends_data/`
-  Add more catchphrases and responses
-  Test different AI models
-  Invite the bot to more servers!
-  Share with friends (they can use the same template for their friends!)

## Need Help?

- Check `README.md` for quick reference
- Review example personality files in `friends_data/`
- Look at `template.json` for structure
- Open an issue on GitHub

---

Happy botting! 

