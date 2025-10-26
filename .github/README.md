# AI Friend Discord Bot Template

A customizable Discord bot template that can act like your friends using AI!

##  Quick Links

- **[Quick Start Guide](../QUICKSTART.md)** - Get running in 5 minutes
- **[Complete Setup](../SETUP.md)** - Detailed setup instructions
- **[Security Guide](../SECURITY.md)** - GitHub deployment safety

## 📖 Documentation

### Getting Started
1. **[QUICKSTART.md](../QUICKSTART.md)** - 5-minute setup
2. **[SETUP.md](../SETUP.md)** - Comprehensive setup guide
3. **[README.md](../README.md)** - Project overview

### Important Files
- `friends_data/config.json` - Active friend configuration
- `friends_data/template.json` - Template for new personalities
- `friends_data/example.json` - Example personality
- `.env` - Environment variables (never commit!)

### Security
- **[SECURITY.md](../SECURITY.md)** - Security practices
- `.gitignore` - Protects sensitive files
- All sensitive data in `.env` (not committed)

##  Key Features

-  **AI-Powered** - Uses OpenAI or local Ollama
-  **Conversation Memory** - Remembers context
-  **Emotional Intelligence** - Detects and responds to emotions
-  **Fully Customizable** - Easy personality configuration
-  **GitHub Ready** - No hardcoded secrets
-  **Template-Based** - Reusable for anyone

## 💡 Usage

### Basic Setup
```bash
npm install
cp env.example .env
# Edit .env and add your Discord bot token
npm start
```

### Configure Personality
Edit `friends_data/[yourfriend].json` with:
- Catchphrases
- Interests
- Speaking style
- Personality traits

See `friends_data/example.json` for a complete example!

##  Documentation Structure

```
 Project Root
├──  QUICKSTART.md      - 5-minute setup
├──  SETUP.md            - Complete setup guide
├──  README.md           - Project overview
├──  SECURITY.md         - Security practices
└──  friends_data/
    ├──  config.json     - Active friend
    ├──  template.json   - Personality template
    └──  example.json    - Example (Alex)
```

##  Next Steps

1. **Read [QUICKSTART.md](../QUICKSTART.md)** - Get running fast
2. **Follow [SETUP.md](../SETUP.md)** - Complete setup
3. **Check [SECURITY.md](../SECURITY.md)** - Before GitHub upload
4. **Customize personality** - Make it your own!

##  Important Notes

-  `.env` is in `.gitignore` - Your secrets are safe
-  All sensitive data is in `.env` only
-  Safe to upload to GitHub
-  Never commit `.env` file
-  Never commit real tokens

##  Template Features

-  **Secure** - No hardcoded secrets
-  **Customizable** - Easy personality setup
-  **AI Powered** - Intelligent conversations
-  **Well Documented** - Complete guides
-  **Template Ready** - GitHub safe


---

**Made with  for creating AI friends on Discord**

