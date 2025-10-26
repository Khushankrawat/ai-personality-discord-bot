# Security Guide 🔒

## For GitHub Deployment

This template is designed to be safe for public GitHub repositories.

### ✅ What's Safe to Commit

- ✅ All code files (`index.js`, `config-loader.js`)
- ✅ Configuration templates (`env.example`, `template.json`)
- ✅ Documentation (`README.md`, `SETUP.md`)
- ✅ Example personalities (`friends_data/example.json`)
- ✅ `.gitignore` file

### ❌ Never Commit

- ❌ `.env` file (contains your Discord bot token)
- ❌ Actual Discord bot token
- ❌ OpenAI API keys
- ❌ Personal friend data (unless they're okay with it being public)

### 🔐 Environment Variables

All sensitive data is stored in `.env`, which is in `.gitignore`:

```bash
# This file is ignored by git
.env
```

### 🛡️ Bot Token Security

**If your bot token is leaked:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your bot
3. Go to "Bot" section
4. Click "Reset Token"
5. Update your `.env` file with new token

**Protect your bot:**
- ✅ Never commit `.env` file
- ✅ Don't share tokens in screenshots
- ✅ Use environment variables in production
- ✅ Regenerate tokens if leaked

### 📝 Template Safety

This template:
- ✅ No hardcoded tokens or sensitive data
- ✅ All configurable values in files
- ✅ Safe to share on GitHub
- ✅ Ready for multiple users to customize

## For Users

When using this template:

1. **Create your own personality files** in `friends_data/`
2. **Keep personal data private** - don't commit if not okay
3. **Use `.env`** for all secrets
4. **Test locally** before deploying

## Production Checklist

Before deploying to production:

- [ ] `.env` is in `.gitignore` ✓
- [ ] No tokens in code ✓
- [ ] Bot token is secure ✓
- [ ] API keys are in environment variables ✓
- [ ] Friends' data is appropriate for public ✓

## What Gets Committed

### Always Safe:
- `index.js` - Bot logic (no secrets)
- `config-loader.js` - Config loader (reads from files)
- `package.json` - Dependencies
- `README.md` - Documentation
- `SETUP.md` - Setup instructions
- `.gitignore` - Git ignore rules
- `friends_data/template.json` - Empty template
- `friends_data/example.json` - Generic example

### Sometimes Safe:
- `friends_data/yourfriend.json` - Only if that friend is okay with it

### Never Safe:
- `.env` - Contains all secrets
- `node_modules/` - Dependencies (redundant)

## Custom Privacy Options

### Option 1: Keep Friends Private

Edit `.gitignore`:
```gitignore
# Keep all friend data private
friends_data/*.json
!friends_data/config.json
!friends_data/template.json
```

### Option 2: Share Examples Only

Commit only example personalities, keep your own private:
```gitignore
# Keep specific friends private
friends_data/john.json
friends_data/mary.json
# But allow examples
friends_data/example.json
```

### Option 3: Open Source Everything

If everyone's okay with sharing, commit all:
```gitignore
# Remove friends_data filtering
# (This is default, all JSON files are committed)
```

## Best Practices

1. **Use GitHub Secrets** (for GitHub Actions deployment)
2. **Rotate tokens regularly**
3. **Limit bot permissions** to minimum needed
4. **Monitor bot activity** in Discord
5. **Don't hardcode ANY secrets**

## Need Help?

If you suspect your bot token is compromised:
1. Reset the token immediately
2. Review recent bot activity
3. Update all deployment environments
4. Consider enabling 2FA on Discord account

---

**Remember**: Security is everyone's responsibility. When in doubt, don't commit it! 🔒

