# FSCSS
FSCSS (Figured Shorthand CSS) is a CSS preprocessor that extends CSS with shorthand utilities, variables, functions, and advanced transformations.


---



## Features

Works in browser and backend (Node.js)

Supports:

- Reusable block → @define name(x,y){...} - https://github.com/fscss-ttr/FSCSS/blob/main/FSCSS_%40define_method.md
 
- Variables ($var, str()) → define reusable values, str(boxBased, "..."), $var:...;
 
- Array Methods (@arr) → define array - https://github.com/fscss-ttr/FSCSS/blob/main/FSCSS_array_method.md
 
- Style Replacement (%n()) → shorthand repeated properties. %2(width, height[: 200px;])
 
- Repeat Function (rpt()) → repeat values quickly

- Copy Function (copy()) → copy parts of values

- String Extractor (@ext()) → extract substrings from values. 

- Drops / Shared Properties → reuse style groups. 

- Attribute Selectors → dynamic selectors. $(attribute:value){...}

- Keyframes ($(@keyframes …)) → generate animations easily

- Vendor Prefixing (-*) → auto add prefixes. -\*-webkit-text-stroke:... 

- Function-based (@fun) → reusable function-like blocks. @fun(name){...} 

- Random Function (@random()) → random values at runtime. @random([.,.,...]) or using array!.randint instead 

- Number Calculation (num()) → evaluate math expressions. num(4+5)

- Import (@import) → include external FSCSS files. @import((*) from "location..."). https://github.com/fscss-ttr/fscss-modules/

- @event → event-based styling logic

- exec() → debugging and runtime helpers. exec(_log, "...")
 
- Variable fallback chain (property: $/var || fallback;)


### Example 
```css
/* FSCSS, Animation compact */
$(@keyframes trans, .box, .card &[3s ase-in infinite]) {
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
### Example
```css
@import((*) from "mymodules/style.fscss") 
@import((
flex-x,
flex-wrap-center as fx-wc,
flex-responsive as fx-r
) from flex-control/fscss)

@arr colors[#1E2783, #8C29B2, #C41348]
.container{
 @fx-wc()
 background: @random(@arr.colors);
} 
.container .card{
 @flex-x() 
 background: linear-gradient(40deg, @arr.colors!.list);
} 

```
### Installation

`npm install -g fscss`

Or locally to your project:

`npm install fscss`

**Browser CDN**
```html
<script src="https://cdn.jsdelivr.net/npm/fscss@1.1.19/exec.min.js" defer></script>
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
