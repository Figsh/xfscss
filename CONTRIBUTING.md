# Contributing to FSCSS

Thank you for your interest in contributing to [FSCSS](https://www.npmjs.com/package/fscss) (Figured Shorthand Cascading Style Sheet) 🚀

We welcome contributions from developers of all experience levels. Whether you're fixing bugs, improving documentation, building plugins, or proposing new features — your help is appreciated.

**Support the cause! Contribute here: https://opencollective.com/fscss**
---

## 📌 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How to Contribute](#-how-to-contribute)
- [Reporting Issues](#-reporting-issues)
- [Suggesting Features](#-suggesting-features)
- [Submitting Pull Requests](#-submitting-pull-requests)
- [Plugin Contributions](#-plugin-contributions)
- [Development Setup](#-development-setup)
- [Coding Guidelines](#-coding-guidelines)
- [Documentation Contributions](#-documentation-contributions)
- [FSCSS Philosophy](#-fscss-philosophy)

---

## 📜 Code of Conduct

By participating in this project, you agree to:

- Be respectful and constructive
- Avoid toxic or harmful behavior
- Provide helpful feedback
- Support new contributors

We aim to maintain a friendly and professional community.

---

## 🚀 How to Contribute

You can contribute by:

- Fixing bugs
- Improving performance
- Adding new features
- Creating plugins
- Enhancing documentation
- Writing examples and tutorials
- Improving CLI functionality

---

## 🐞 Reporting Issues

Before creating an issue:

1. **Check** if it already exists.
2. **Use** a clear and descriptive title.
3. **Provide:**
   - FSCSS version
   - Environment (Browser / Node / CLI)
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Code snippets if applicable

---

## 💡 Suggesting Features

When suggesting a feature:

- Explain the problem it solves
- Provide example usage
- Describe how it fits into FSCSS philosophy
- Mention if it's runtime-only or CLI-compatible

---

## 🔀 Submitting Pull Requests

1. **Fork** the repository
2. **Create** a new branch
   ```bash
   git checkout -b feature/your-feature-name
```

1. Make your changes
2. Test thoroughly
3. Commit clearly
   ```bash
   git commit -m "feat: add new gradient utility"
   ```
4. Push your branch
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request

PR Guidelines

· Keep changes focused and modular
· Do not mix unrelated fixes
· Write clear commit messages
· Update documentation when needed
· Ensure backward compatibility when possible

---

🧩 Plugin Contributions

FSCSS supports modular plugins.

When contributing a plugin:

· Ensure safe execution
· Keep it lightweight
· Provide fallback values for variables
· Document usage examples
· Test across different environments

---

🛠 Development Setup

Runtime Testing (CDN)

Include in your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@latest/exec.min.js" defer></script>
```

CLI Development

Install globally:

```bash
npm install -g fscss
```

Compile FSCSS to standard CSS:

```bash
fscss input.fscss output.css
```

---

🧠 Coding Guidelines

· Keep the core engine lightweight
· Avoid bloating with unnecessary features
· Maintain shorthand philosophy
· Follow consistent naming patterns
· Ensure compatibility with both runtime and CLI modes
· Write clean, readable code
· Add comments for complex logic

---

📖 Documentation Contributions

Documentation is as important as code.

You can help by:

· Fixing grammar issues
· Improving clarity
· Adding examples
· Writing tutorials
· Creating plugin guides

Documentation Standards

All documentation should be:

· Clear — Easy to understand
· Concise — No unnecessary fluff
· Beginner-friendly — Accessible to new users
· Consistent — Follows FSCSS style and terminology

---

🎯 FSCSS Philosophy

· Shorthand-first styling — Write less, do more
· Modular architecture — Use what you need
· Runtime + build-time support — Flexible deployment options
· Minimal overhead — Lightweight and fast
· Developer productivity focused — Make styling enjoyable

If your contribution aligns with this philosophy, you're on the right track.

---

❤️ Thank You

Your contributions help FSCSS grow into a powerful modular styling ecosystem.

Let's build something great together.
