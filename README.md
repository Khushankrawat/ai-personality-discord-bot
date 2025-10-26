# AI Friend Discord Bot Template 🤖

A customizable Discord bot template that can act like your friends using AI! This bot learns from personality data and creates organic, contextual conversations.

## 📝 What You'll Need

- **Discord Account** (free) - https://discord.com
- **Node.js** (v16+) - https://nodejs.org
- **A Discord Bot Token** - Get it from [Discord Developer Portal](https://discord.com/developers/applications) in 2 minutes

## ✨ Features

- **🤖 AI-Powered Organic Responses** using OpenAI GPT-3.5-turbo or local Ollama
- **🧠 Conversation Memory System** - Remembers previous messages for intelligent responses
- **💭 Intelligent Question Generation** - Asks follow-up questions to keep conversations flowing
- **🎯 Context Awareness** - Understands conversation topics and responds appropriately
- **❤️ Emotional Intelligence** - Detects user mood and responds empathetically
- **🎭 Fully Customizable** - Configure personalities in `friends_data/` folder
- **🔒 Security-First** - Template-ready for GitHub with no hardcoded values

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/ai-friend-discord-bot.git
cd ai-friend-discord-bot
npm install
```

### 2. Get Your Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Click **"New Application"** → Name it → **Create**
3. Go to **"Bot"** → Click **"Add Bot"** → Confirm
4. Enable **"Message Content Intent"** under "Privileged Gateway Intents"
5. Click **"Reset Token"** → Copy the token

⚠️ **Keep your token secret!** Never share it publicly.

### 3. Set Up Environment
```bash
# Copy the example file
cp env.example .env

# Edit and add your token
nano .env  # or: code .env (VS Code)
```

Paste your bot token from Step 2:
```env
DISCORD_TOKEN=paste_your_token_here
OPENAI_API_KEY=your_openai_key  # Optional
```

### 4. Configure Your Friend's Personality
```bash
# Copy the template (optional - example.json already works)
cp friends_data/template.json friends_data/myfriend.json

# Edit personality data
nano friends_data/myfriend.json
```

Or just use the example: `friends_data/example.json`

### 5. Invite Bot to Your Server

1. Discord Developer Portal → **"OAuth2"** → **"URL Generator"**
2. Select: `bot` and `applications.commands` (Scopes)
3. Select bot permissions: Send Messages, Use Slash Commands, Read History
4. Copy the URL → Open in browser → Select server → **Authorize**

### 6. Run
```bash
npm start
```

## 📁 Project Structure

```
ai-friend-discord-bot/
├── friends_data/           # Personality configuration
│   ├── config.json         # Active friend & bot settings
│   ├── template.json        # Template for new friends
│   └── example.json         # Example personality
├── config-loader.js         # Configuration loader
├── index.js                 # Main bot logic
├── .gitignore              # Git ignore rules
├── env.example             # Environment template
└── README.md               # This file
```

## 🎭 Creating a Personality

Edit `friends_data/yourfriend.json`:

```json
{
  "name": "Your Friend's Name",
  "description": "A brief description",
  "catchphrases": [
    "Phrases they use",
    "Things they say"
  ],
  "interests": [
    "Their hobbies",
    "What they love"
  ],
  "responses": {
    "topic1": [
      "How they respond to this",
      "More responses"
    ]
  },
  "randomThoughts": [
    "Things they might say randomly"
  ],
  "systemPrompt": "Detailed description of how they speak, act, and think...",
  "language": "english",
  "personalityTraits": {
    "empathy": [
      "How they express empathy"
    ]
  }
}
```

**The `systemPrompt` is the most important field!** It teaches the AI how to act like your friend:
- Describe their speaking style
- Add personality quirks
- Include how they respond to different situations
- Add their sense of humor
- Mention their interests and how they talk about them

## 🎮 How to Use

### Basic Commands
- **@BotName** - Mention the bot to start chatting
- **Reply to bot** - Continue the conversation
- `/personality` - Learn about the current personality

### Example Conversation
```
You: @MyFriend hey what's up?
Bot: Hey! Just thinking about [their interest]. What about you?

You: I'm good
Bot: That's awesome! [personality-specific response]
```

## 🔧 Configuration

### Environment Variables (`.env`)
```env
DISCORD_TOKEN=your_bot_token
OPENAI_API_KEY=your_api_key  # Optional
```

### Personality Configuration (`friends_data/config.json`)
```json
{
  "activeFriend": "example",
  "botName": "FriendBot"
}
```

## 🛠️ Advanced Features

### AI Models
- **OpenAI GPT-3.5-turbo** (default) - Best quality, paid
- **Ollama (Local)** - Free but requires local setup
- **Fallback** - Works without AI

### Personality Traits
Configure multiple personality aspects:
- `curiosity` - How they ask questions
- `empathy` - How they support others
- `enthusiasm` - How they express excitement
- `confusion` - How they handle confusion
- `support` - How they encourage others

### Conversation Intelligence
- Detects emotional context
- Maintains conversation memory
- Asks intelligent follow-up questions
- Provides empathetic responses
- Manages topic transitions

## 📚 Setup Guide

See [SETUP.md](SETUP.md) for detailed setup instructions including:
- Discord bot creation
- API key setup
- Ollama installation
- Deployment options

## 🔒 Security for GitHub

This template is GitHub-ready:
- ✅ No hardcoded tokens
- ✅ No sensitive data committed
- ✅ `.env` in `.gitignore`
- ✅ Template files only
- ✅ Example personalities are safe to share

## 📄 License

MIT License - Feel free to use and modify!

## 🙏 Credits

Built with:
- [Discord.js](https://discord.js.org/)
- [OpenAI](https://openai.com/)
- [Ollama](https://ollama.ai/)

---

**Note**: Use responsibly and respect privacy. Don't share others' personal information.
