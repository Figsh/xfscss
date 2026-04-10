# Contributing to FSCSS

Thank you for your interest in contributing to [FSCSS](https://www.npmjs.com/package/fscss) (Figured Shorthand Cascading Style Sheet). 

**Main repository:** [https://github.com/Figsh/xfscss](https://github.com/Figsh/xfscss)  
**Plugin ecosystem:** [https://github.com/fscss-ttr](https://github.com/fscss-ttr)  
**Support the project:** [https://opencollective.com/fscss](https://opencollective.com/fscss)

---

## Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How to Contribute](#-how-to-contribute)
- [Reporting Issues](#-reporting-issues)
- [Suggesting Features](#-suggesting-features)
- [Submitting Pull Requests](#-submitting-pull-requests)
- [Development Setup](#-development-setup)
- [Coding Guidelines](#-coding-guidelines)
- [Documentation Contributions](#-documentation-contributions)
- [Building Plugins](#-building-plugins)
- [FSCSS Philosophy](#-fscss-philosophy)

---

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and constructive
- Avoid toxic or harmful behavior
- Provide helpful feedback
- Support new contributors

We aim to maintain a friendly and professional community.

---

## How to Contribute

This repo is the **core FSCSS engine** — the compiler and runtime that powers everything else. Contributions here include:

- Fixing bugs in the compiler or runtime
- Improving performance
- Adding or refining core language features
- Improving CLI functionality
- Writing examples and tutorials
- Enhancing documentation

> Looking to build or contribute a **plugin**? Head over to the [fscss-ttr](https://github.com/fscss-ttr) ecosystem org instead.

---

## Reporting Issues

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

## Suggesting Features

When suggesting a feature:

- Explain the problem it solves
- Provide example usage
- Describe how it fits into FSCSS philosophy
- Mention if it's runtime-only, CLI-compatible, or both

---

## Submitting Pull Requests

1. **Fork** the repository
2. **Create** a new branch
```bash
git checkout -b feature/your-feature-name
```
3. Make your changes
4. Test thoroughly
5. Commit clearly
```bash
git commit -m "feat: add new gradient utility"
```
6. Push your branch
```bash
git push origin feature/your-feature-name
```
7. Open a Pull Request

**PR Guidelines**

- Keep changes focused and modular
- Do not mix unrelated fixes
- Write clear commit messages
- Update documentation when needed
- Ensure backward compatibility when possible

---

## Development Setup

**Runtime Testing (CDN)**

Include in your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/fscss@latest/exec.min.js" defer></script>
```

**CLI Development**

Install globally:

```bash
npm install -g fscss
```

Compile FSCSS to standard CSS:

```bash
fscss input.fscss output.css
```

---

## Coding Guidelines

- Keep the core engine lightweight
- Avoid bloating with unnecessary features
- Maintain the shorthand philosophy
- Follow consistent naming patterns
- Ensure compatibility with both runtime and CLI modes
- Write clean, readable code
- Add comments for complex logic

---

## Documentation Contributions

Documentation is as important as code. You can help by:

- Fixing grammar or clarity issues
- Adding examples
- Writing tutorials
- Improving the README

**Documentation Standards**

All documentation should be:

- **Clear** — Easy to understand
- **Concise** — No unnecessary fluff
- **Beginner-friendly** — Accessible to new users
- **Consistent** — Follows FSCSS style and terminology

---

## Building Plugins

FSCSS has a dedicated plugin ecosystem under the [fscss-ttr](https://github.com/fscss-ttr) org. If you want to build a plugin rather than contribute to the core:

- Browse existing plugins for conventions and structure
- Plugins should be lightweight, safe, and well-documented
- Provide fallback values for variables
- Test across runtime and CLI environments

---

## FSCSS Philosophy

- **Shorthand-first styling** — Write less, do more
- **Modular architecture** — Use what you need
- **Runtime + build-time support** — Flexible deployment options
- **Minimal overhead** — Lightweight and fast
- **Developer productivity focused** — Make styling enjoyable

If your contribution aligns with this philosophy, you're on the right track.

---

❤️ Thank You

Your contributions help FSCSS grow into a powerful modular styling ecosystem.

Let's build something great together.
