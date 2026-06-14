# Your first contribution — a beginner's guide 🌱

**New to open source? Welcome — you're exactly who this guide is for.** You don't
need to be an expert. If you're a college or university student (or just curious),
this walks you through making your first change to Tripti, step by step, in plain
language. Take your time. There's no rush, and questions are always okay.

---

## 1. What is this project, really?

Tripti is a small **web app** that helps Indian households decide what to cook,
plan groceries, and do it on a budget — privately, on their own phone. It's written
in **TypeScript** (JavaScript with type-checking) using **React** and **Next.js**
(popular tools for building websites).

**Contributing** just means "helping improve the project" — and that can be as small
as fixing a typo or adding a word in Hindi. Every little bit genuinely helps. 💛

## 2. A tiny glossary (no need to memorize)

| Word | In plain English |
|---|---|
| **Repository** ("repo") | The project's folder of files, stored on GitHub. |
| **Fork** | *Your own copy* of the repo, under your GitHub account. |
| **Clone** | Downloading a repo to your computer so you can work on it. |
| **Branch** | A safe side-copy of the code where you make changes without touching the main version. |
| **Commit** | A saved snapshot of your changes, with a short message describing them. |
| **Push** | Uploading your commits from your computer back to GitHub. |
| **Pull Request** ("PR") | A polite request that says "here are my changes — please review and add them." |
| **Issue** | A note describing a bug or an idea. Great place to start a conversation. |
| **CI** | Robots that automatically check your change builds and is safe. |

## 3. Install your tools (once)

You'll need four free things:

1. **Node.js** (the engine that runs the app) — install the **LTS** version from
   [nodejs.org](https://nodejs.org). We use Node 18.17+ (20 recommended; see `.nvmrc`).
2. **Git** (tracks changes) — [git-scm.com](https://git-scm.com).
3. **A code editor** — [VS Code](https://code.visualstudio.com) is a friendly choice.
4. **A GitHub account** — [github.com](https://github.com).

To check Node and Git installed, open a terminal and run:

```bash
node -v
git -v
```

If both print a version number, you're ready. 🎉

## 4. Make your first change (step by step)

### a) Fork the repo
On the [Tripti GitHub page](https://github.com/bb1nfosec/tripti), click **Fork**
(top-right). This makes your own copy.

### b) Clone your fork to your computer
Replace `YOUR-USERNAME` with your GitHub username:

```bash
git clone https://github.com/YOUR-USERNAME/tripti.git
cd tripti
```

### c) Install and run it

```bash
npm install        # downloads the project's building blocks (takes a minute)
npm run dev        # starts the app
```

Open **http://localhost:3000** in your browser. You're running Tripti! 🥳

### d) Create a branch for your change

```bash
git checkout -b my-first-change
```

### e) Make a small edit
Pick something tiny (see ideas below), save the file in your editor, and check the
browser updated.

### f) Run the checks (the same ones the robots run)

```bash
npm run typecheck
npm run lint
npm run build
```

If these pass, great. If not, read the message — it usually points right at the line.

### g) Save and upload your change

```bash
git add -A
git commit -m "docs: fix a small typo"   # describe what you did
git push origin my-first-change
```

### h) Open a Pull Request
GitHub will show a **"Compare & pull request"** button — click it, write a sentence
about what you changed, and submit. That's it — you've contributed! 🌟

The robots (CI) will run automatically. A maintainer will take a look, and your
change can be merged.

## 5. Good first things to try

Truly beginner-friendly, in rough order of easiness:

- ✏️ **Fix a typo** in any `.md` file (like this one) or in app text.
- 🌐 **Improve a translation** — add or polish Hindi/Hinglish copy in
  [`src/lib/i18n.ts`](../src/lib/i18n.ts) or [`src/lib/provI18n.ts`](../src/lib/provI18n.ts).
- 🥗 **Add a grocery item** to the catalog in
  [`src/data/provisioning.ts`](../src/data/provisioning.ts) (copy an existing line and
  change the values).
- 🧺 **Add a storage tip** in [`src/screens/SourcingScreen.tsx`](../src/screens/SourcingScreen.tsx)
  (the `TIPS` list).
- 📖 **Improve the docs** — if something here confused you, make it clearer!

Look for issues labelled [**good first issue**](https://github.com/bb1nfosec/tripti/labels/good%20first%20issue)
on GitHub. If there are none open, comment on any issue or open a new one to say hi.

## 6. If something breaks (common fixes)

- **`npm install` fails** → make sure Node is 18.17+ (`node -v`). Try again on a
  stable internet connection.
- **"port 3000 already in use"** → another app is using it; stop it, or run
  `npm run dev -- -p 3001`.
- **A check fails and you're stuck** → that's normal! Copy the error into your PR or
  an issue and ask — we're happy to help.

## 7. Asking for help (please do!)

- Open an [issue](https://github.com/bb1nfosec/tripti/issues) describing what you're
  trying to do and what happened.
- Be kind and patient — maintainers are volunteers, and so are reviewers.
- ⚠️ **Never paste an API key** into an issue, PR, or screenshot.

## 8. The promise

Your first PR doesn't have to be perfect. We'll give friendly, constructive feedback,
and "I'm a beginner" is always a welcome thing to say. By taking part you agree to our
[Code of Conduct](../CODE_OF_CONDUCT.md) — basically: be kind.

Welcome to open source. We're glad you're here. 🙌
