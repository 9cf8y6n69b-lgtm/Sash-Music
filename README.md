# 🎵 EnzoMusic — The Ultimate Premium Music Bot

<p align="center">
  <img src="https://img.shields.io/badge/Discord.js-v14.16-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord.js" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D16.9-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Lavalink-v4-31B2F2?style=for-the-badge&logo=soundcharts&logoColor=white" alt="Lavalink" />
</p>

Hey there! Welcome to **EnzoMusic**! 🎶 This isn't just another standard discord music bot. It's a high-performance, next-gen audio experience built from the ground up on **Lavalink v4** and the latest **discord.js v14**. 

Designed with an ultra-sleek, clean gray aesthetic (`ButtonStyle.Secondary`) and powered by your own custom-made Discord guild emojis, it is designed to make your server look and sound absolutely elite

---

## Features

*   🔴 **Crystal Clear Audio (Lavalink v4)**: Experience zero lag, high-fidelity sound quality, and seamless playback.
*   🔘 **Sophisticated Gray Controller**: A clean, minimalist player interface utilizing highly polished gray buttons for a modern look.
*   🎨 **Custom Guild Emojis Out-of-the-Box**: Fully integrated with your custom emojis! The bot reads and renders your specific server emojis directly inside the interactive controller and slash commands.
*   📜 **Modern Interactive `/help` Menu**: A beautiful, fluid string select menu featuring categorised commands and custom emoji indicators for effortless navigation.
*   💾 **Rock-Solid & Secure**: Built with production-ready standards, modern NPM dependency management, and built-in security features to safeguard your tokens.

---

> [!NOTE]
> **Emoji Customization**: 
> All player controls and menu indicators are configured to read from your guild's custom emojis. Just drop your emoji IDs into `config.js` and watch the magic happen!

> [!IMPORTANT]
> **Prerequisites & Node Version**:
> EnzoMusic requires **Node.js v16.9.0** or higher to run. We highly recommend using Node **v18** or **v20** for maximum stability and performance!

> [!WARNING]
> **Keep Your Credentials Safe 🔒**:
> Never share your `.env` file or your actual bot token with anyone or upload it to public repositories. We've created a custom `.gitignore` file to ensure your database and credentials are never leaked!

---

## 🛠️ Quick Installation Guide

Setting up your bot takes less than two minutes! Just follow these easy steps:

### 1. Install Dependencies
Open your terminal in the bot's root directory and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a file named `.env` in the root folder and add your credentials:
```env
TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
```

### 3. Customize config.js
Pop open the `config.js` file to adjust the embed colors, status presences, and map your uploaded emoji IDs! Everything is labeled clearly so you can customize it in seconds.

### 4. Let's Play! 🚀
Fire up the bot and enjoy the vibes:
```bash
npm start
```

---

## 📂 Project Anatomy

*   📁 `commands/` — All slash commands (audio controls, filters, lyrics, stats, and configurations).
*   📁 `events/` — Discord Gateway events and real-time voice connection handlers.
*   📁 `icons/` — A specialized directory containing premium white Phosphor SVG icons ready for you to upload as emojis!
*   📁 `lib/` — The core framework classes managing the bot instance, logger, and client handlers.
*   📄 `config.js` — The centralized configuration file to tweak the bot's look, presence, and emojis.

---

## 🤝 Contributing & Feedback

This bot is crafted with pure passion to deliver the finest audio experience. If you have any suggestions, feature ideas, or want to contribute to the codebase, feel free to submit a pull request!

Built Manually by [Enzo](https://enzo.is-a.dev/)