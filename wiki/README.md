# Stake Engine Client Wiki

This directory contains the comprehensive wiki documentation for the Stake Engine Client.

## 📚 Wiki Pages Created

### Overview & Getting Started
- **Home.md** - Main wiki homepage with navigation
- **Getting-Started.md** - Installation and setup guide

### API Reference (One function per page)
- **requestAuthenticate.md** - Player authentication
- **requestBet.md** - Place bets and start rounds
- **requestEndRound.md** - End betting rounds
- **requestBalance.md** - Get player balance
- **requestEndEvent.md** - Track game events
- **requestForceResult.md** - Search for specific results (testing)

### Guides & References
- **Error-Handling.md** - Comprehensive error handling guide
- **Status-Codes.md** - Complete status code reference
- **Amount-Conversion.md** - Understanding format conversions

## 🚀 Uploading to GitHub

### Option 1: Automatic Upload Script

```bash
cd wiki
./upload-wiki.sh
```

The script will:
1. Clone the wiki repository
2. Copy all wiki files
3. Commit and push to GitHub

### Option 2: Manual Upload

1. **Enable Wiki** in your GitHub repository settings
2. **Create initial page** manually on GitHub
3. **Clone wiki repository**:
   ```bash
   git clone https://github.com/raw-fun-gaming/stake-engine-client.wiki.git
   ```
4. **Copy files** from this directory
5. **Commit and push**:
   ```bash
   git add *.md
   git commit -m "Add comprehensive wiki documentation"
   git push origin master
   ```

### Option 3: File-by-File Upload

Use GitHub's wiki interface to create pages manually by copying content from each .md file.

## 🔗 Wiki Structure

The wiki provides:
- **Easy navigation** with comprehensive index
- **One function per page** for detailed documentation
- **Practical examples** with real-world usage
- **Error handling guides** with specific solutions
- **Best practices** throughout all pages
- **Cross-references** between related topics

## ✨ Features

- 📱 **Browser-friendly** - Emphasizes URL parameter usage
- 🎯 **Function-focused** - Dedicated page for each API function
- 💡 **Example-rich** - Practical code examples throughout
- 🛡️ **Error-aware** - Comprehensive error handling coverage
- 🔄 **Cross-referenced** - Easy navigation between topics

## 📝 Content Highlights

Each function page includes:
- Complete syntax and parameters
- URL parameter fallback explanation
- Multiple practical examples
- Error handling strategies
- Status code references
- Best practices
- Related function links

The wiki serves as a complete reference for developers using the Stake Engine Client in any JavaScript environment.