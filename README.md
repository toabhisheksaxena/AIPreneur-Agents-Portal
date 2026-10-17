# AIPreneur • Humanized Conversational Voice & Member-Gated AI Workforce Portal (`aipreneurglobal.com`)

**Brand Company Name:** AIPreneur  
**Official Domain & Branding:** [https://aipreneurglobal.com/](https://aipreneurglobal.com/)  
**Connected Background Gmail Account:** `tothedataboy@gmail.com` (silently routed in `app.js` and `server.rb` with zero UI exposure)

---

## 1. How to Connect This Project to Your GitHub Repository

We have prepared a `.gitignore` file in `/Users/toabhisheksaxena/Documents/Gemini/AIPreneur-AI-Workforce-Portal/.gitignore` so sensitive configuration files (`smtp_config.json`, `.env`, and runtime `.log` files) are automatically excluded when you push to GitHub.

You can connect this project to GitHub using either **Terminal (Git CLI)** or **GitHub Web / GitHub Desktop**:

### Option A: Connect via macOS Terminal (Git CLI)

1. **Enable macOS Git Command Line Tools (One-Time Setup on This Mac)**:
   On your Mac, `/usr/bin/git` currently prompts for Apple's Command Line Developer Tools. Run this command in **Terminal** and click **Install** in the macOS popup (skip if already installed):
   ```bash
   xcode-select --install
   ```

2. **Create a New Empty Repository on GitHub**:
   * Go to [https://github.com/new](https://github.com/new).
   * Enter a **Repository name** (e.g., `aipreneur-ai-workforce-portal`).
   * Select **Public** or **Private**.
   * Leave **"Add a README file"** and **"Add .gitignore"** **unchecked** (since this project folder already has both).
   * Click **Create repository** and copy your repository URL (`https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git`).

3. **Initialize, Link & Push Your Project from Terminal**:
   Run these commands in **Terminal**:
   ```bash
   cd "/Users/toabhisheksaxena/Documents/Gemini/AIPreneur-AI-Workforce-Portal"

   # 1. Initialize Git on the main branch
   git init -b main

   # 2. Stage and commit all portal files
   git add .
   git commit -m "Initial commit: AIPreneur AI Workforce & Customer Portal"

   # 3. Connect your local folder to your GitHub repository
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git

   # 4. Push the main branch to GitHub
   git push -u origin main
   ```
   *(Note: When GitHub prompts for a password in Terminal, paste a [GitHub Personal Access Token](https://github.com/settings/tokens) with the `repo` scope, or sign in via `gh auth login`.)*

---

### Option B: Connect Without Terminal (GitHub Web Upload or GitHub Desktop)

If you want to connect and publish immediately without installing macOS Xcode Command Line Tools:

* **Via GitHub Web Interface (Fastest)**:
  1. Create a new repository at [https://github.com/new](https://github.com/new).
  2. On the next screen, click **"uploading an existing file"**.
  3. Open `/Users/toabhisheksaxena/Documents/Gemini/AIPreneur-AI-Workforce-Portal` in Finder and drag-and-drop `index.html`, `styles.css`, `app.js`, `server.rb`, `server.py`, `README.md`, and `.gitignore` into the browser window.
  4. Click **Commit changes**.
* **Via GitHub Desktop**:
  1. Open [GitHub Desktop](https://desktop.github.com/) (which bundles its own built-in Git binary).
  2. Click **File** → **Add Local Repository...** and choose `/Users/toabhisheksaxena/Documents/Gemini/AIPreneur-AI-Workforce-Portal` (click **"create a repository"** if prompted).
  3. Click **Publish repository** in the top bar to push directly to your GitHub account.

---

### Step 3 (Optional): Publish Live on GitHub Pages (`aipreneurglobal.com`)

1. Open your repository on GitHub and go to **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, choose **Deploy from a branch**.
3. Select branch **`main`** and folder **`/ (root)`**, then click **Save**.
4. Under **Custom domain**, you can optionally enter `aipreneurglobal.com` (or `portal.aipreneurglobal.com`) and enable **Enforce HTTPS**.

---

## 2. Running the Local Portal & Email Notification Server (`http://localhost:8090`)

To run the local backend server (which serves the portal at `http://localhost:8090`, stores all registrations and inquiries in `aipreneur_portal.db`, and dispatches email notifications to `tothedataboy@gmail.com`):

```bash
cd "/Users/toabhisheksaxena/Documents/Gemini/AIPreneur-AI-Workforce-Portal"
ruby server.rb
```

Then open **[http://localhost:8090](http://localhost:8090)** in your browser.
