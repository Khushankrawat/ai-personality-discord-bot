# Quick Start Guide 

Get your bot running in 5 minutes!

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Get Your Discord Bot Token (2 min)

### Get the Token:
1. Go to https://discord.com/developers/applications
2. Click **"New Application"** → Give it a name (e.g., "My Friend Bot")
3. Click **"Bot"** in the left sidebar → Click **"Add Bot"** → Click **"Yes, do it!"**
4. Under **"Privileged Gateway Intents"**, enable:
   -  **Message Content Intent** (required!)
5. Click **"Reset Token"** → Click **"Yes, do it!"**
6. **COPY THE TOKEN** - This is your `DISCORD_TOKEN`!

 **Keep this secret!** This is like a password for your bot.

### What is a Bot Token?
Your bot token is a secret code that lets your bot connect to Discord. It's like a password that proves the bot is yours. Never share it publicly!

## Step 3: Add Token to .env (1 min)

```bash
# Copy the example file
cp env.example .env

# Edit and add your token (use any text editor)
nano .env  # or: code .env (VS Code) or: open .env (macOS)
```

Replace `your_bot_token_here` with the token you copied from Step 2:
```env
DISCORD_TOKEN=paste_your_actual_token_here
OPENAI_API_KEY=  # Optional - leave empty if not using OpenAI
```

Save the file (Ctrl+X, then Y, then Enter in nano).

The example personality (`example`) is already configured!
Want to customize? See [SETUP.md](SETUP.md)

## Step 4: Invite Bot to Server (1 min)

1. In Discord Developer Portal → "OAuth2" → "URL Generator"
2. Check: `bot` and `applications.commands`
3. Check bot permissions:
   - Send Messages
   - Use Slash Commands
   - Read Message History
4. Copy the URL → Open in browser → Select server → Authorize

## Step 5: Run! (30 seconds)

```bash
npm start
```

You should see: `FriendBot Bot is ready! Logged in as YourBot#1234`

## Step 6: Test

Go to your Discord server and type:
```
@YourBot hello
```

The bot should respond!

## What's Next?

-  Customize your friend's personality in `friends_data/example.json`
-  Add multiple friends in `friends_data/`
-  Switch between friends in `friends_data/config.json`
-  Deploy for 24/7 hosting (see SETUP.md)

## Need Help?

- **Detailed setup**: See [SETUP.md](SETUP.md)
- **Configuration**: See [README.md](README.md)
- **Security**: See [SECURITY.md](SECURITY.md)
- **Examples**: Check `friends_data/example.json`

## Common Issues

**Bot not responding?**
- Check token is correct in `.env`
- Verify bot has permissions
- Ensure "Message Content Intent" is enabled

**"Failed to load configuration" error?**
- Make sure `friends_data/example.json` exists
- Check `friends_data/config.json` has correct settings

**Need more help?**
- See [SETUP.md](SETUP.md) for detailed troubleshooting
- Open an issue on GitHub

---

That's it! You're ready to chat with your AI friend! 

