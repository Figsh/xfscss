# FSCSS

**FSCSS (Figured Shorthand Cascading Style Sheets)** is a powerful CSS preprocessor that extends CSS with shorthand utilities, variables, functions, and advanced transformations.

It is designed to make styling faster, reusable, and expressive — without losing standard CSS compatibility.

---

##  Core Features

### FSCSS works in both:

-  Browser (via CDN)
-  Node.js (CLI / build tools)

---

**Reusable Logic**

- `@define` → reusable blocks
- `@fun` → function-style reusable properties
- `@obj` → structured reusable style objects
```css
@define center(elem){`
  @use(elem){
    display:flex;
    justify-content:center;
    align-items:center;
  }
`}

@center(.box)
```
---

**Variables & Dynamic Values**

- `$var` → standard variables
- `str()` → inline expandable text variables
- fallback operator → `$ / var || fallback`
```css
$color: red;

.box{
  color: $color!;
}
```
---

**Arrays/list & Data Handling**

- `@arr` → define arrays
- `.list`, `.join`, `.randint`
- loop generation
- with random
```css
@arr colors[#1E2783, #8C29B2, #C41348]

.box{
  background: @random(@arr.colors);
}
```
---

**Shorthand & Utilities**

- `%n()` → apply multiple properties
- `rpt()` → repeat values
- `copy()` → reuse values
- `@ext()` → extract strings

`%2(width, height [: 200px;])`

---

**Dynamic & Smart Functions**

- `@random()` → dynamic values
- `num()` → math evaluation
- `count()` → number ranges

`width: num(89+11/4)px;`

---

**Animations & Selectors**

- Keyframes shorthand
- Attribute selectors
- Vendor prefixing
- 
```css
$(@keyframes trans, .box &[3s ease-in infinite]){
  from{ width:0; }
  to{ width:200px; }
}
```
---

**Imports & Modularity**

- Local & remote imports
- Alias support
- Wildcard import
```css
@import((*) from "mymodules/style.fscss")
```
Modules:
https://github.com/fscss-ttr/fscss-modules/

---

**Logic System**

- `@event` → conditional styling
- `exec()` → debugging tools

```css
@event theme(mode){
 if mode:dark{
  return: #1a1a1a;
 }
 el{
  return: #f8f8f8;
 } 
} 
```

---

## Example

```css
@import((flex-x) from flex-control/fscss)

@arr colors[#1E2783, #8C29B2, #C41348]

.container{
  @flex-x()
  background: @random(@arr.colors);
}
```
---

## Installation

**Global**
```bash
npm install -g fscss
```
**Local**
```bash
npm install fscss
```
---

** Browser Usage**
```html
<script src="https://cdn.jsdelivr.net/npm/fscss@latest/exec.min.js" defer></script>
```
**Use directly:**
```html
<link type="text/fscss" href="style.fscss">
```
**Or:**
```html
<style>
@import(exec(style.fscss))
</style>
```
> Use "defer" or "async" when loading the script.

---

## What FSCSS Does

FSCSS transforms shorthand syntax into valid CSS, making your styles:

- shorter
- reusable
- dynamic
- easier to maintain

---

## Ecosystem

- VS Code Extension (syntax + snippets)
- FSCSS Modules
- CLI Compiler
- Browser Runtime

---

Learn More

https://fscss.devtem.org/

---

License

MIT *© Figsh — FSCSS*
