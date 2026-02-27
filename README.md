# FSCSS
FSCSS (Figured Shorthand CSS) is a CSS preprocessor that extends CSS with shorthand utilities, variables, functions, and advanced transformations.
It works both in the browser and on the backend (Node.js).


---



## Features

Works in browser and backend (Node.js)

Supports:

- Variables ($var, str()) → define reusable values

- Style Replacement (%n()) → shorthand repeated properties
- Repeat Function (rpt()) → repeat values quickly

- Copy Function (copy()) → copy parts of values

- String Extractor (@ext()) → extract substrings from values

- Drops / Shared Properties → reuse style groups

- Attribute Selectors → dynamic selectors

- Keyframes ($(@keyframes …)) → generate animations easily

- Vendor Prefixing (-*) → auto add prefixes

- Function-based (@fun) → reusable function-like blocks

- Array Methods (@arr) → define & loop arrays

- Random Function (@random()) → random values at runtime

- Number Calculation (num()) → evaluate math expressions

- Import (@import) → include external FSCSS files

- @event → event-based styling logic

- exec() → debugging and runtime helpers
 
- Variable fallback chain (property: $/var || fallback;)


### Example 
```css
/* FSCSS, Animation compact */
$(@keyframes trans, .box, .card &[3s ease-in infinite]) {
  from {
    %2(width, height [: 0;]) 
    background: red;
  } 
  to {
    %2(width, height [: 200px;])
    background: blue;
  }
}
```

### Installation

`npm install -g fscss`

Or locally to your project:

`npm install fscss`

**Browser CDN**
```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.13/exec.min.js" defer></script>
```
Usage

Link FSCSS files directly:
```html
<link type="text/fscss" href="style.fscss">
```
Or import inside a style block:
```html
<style>
@import(exec(style.fscss))
</style>
```
**Async or defer is required for script loading.**


---


Transform shorthand syntax into valid CSS

Extensible with plugins

---

### https://fscss.devtem.org/

---

📜 License

MIT © Figsh—FSCSS
