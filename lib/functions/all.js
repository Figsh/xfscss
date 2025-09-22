
function procNum(css){
const regex = /num\((.*?)\)/g;
function evaluateExpression(expression) {
  try {
    return eval(expression);
  } catch (e) {
    console.error('Invalid expression:', expression);
    return expression;
  }
}

const processedCSS = css.replace(regex, (match, expression) => {
  
  return evaluateExpression(expression);
});

return (processedCSS);
  }
const arraysExfscss = {}; // Renamed the global variable
const orderedxFscssRandom = {};

const exfMAX_DEPTH = 10; // Prevent infinite recursion
function extractBlock(css, startIndex) {
  let depth = 0;
  let i = startIndex;
  while (i < css.length) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
    if (depth === 0) break;
    i++;
  }
  return css.slice(startIndex, i + 1);
}

function parseConditionBlocks(block) {
  const blocks = [];
  // Adjusted regex to correctly capture the block content within curly braces
  const conditionRegex = /(if|el-if|el)\s*([^{}]*?)\s*\{([\s\S]*?)\}/g;
  let match;
  while ((match = conditionRegex.exec(block)) !== null) {
    blocks.push({
      type: match[1],
      condition: match[2].trim(),
      block: match[3].trim()
    });
  }
  return blocks;
}
function procExC(css) {
  const regex = /exec\((_log|_error|_warn|_info),\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\)/g;
  let jsCode = '';
  let match;
  
  // Replace exec(...) with nothing (remove from CSS) while collecting code
  const cleanedCSS = css.replace(regex, (full, method, dQ, sQ, raw) => {
    const arg = dQ || sQ || raw;
    
    if (!['_log', '_error', '_warn', '_info'].includes(method)) {
      console.warn(`fscss[exec(console)]: Unsupported method: ${method}`);
      return ''; // strip it from CSS
    }
    
    if (!arg) {
      console.warn(`fscss[exec(console)]: Empty argument for method: ${method}`);
      return ''; // strip it from CSS
    }
    
    jsCode += `console.${method.slice(1)}("${arg.replace(/"/g, '\\"')}");\n`;
    return ''; // ensure CSS isn’t broken
  });
  
  // Run console code safely
  if (jsCode) {
    try {
      new Function(jsCode)();
    } catch (e) {
      console.error("fscss[exec(console)]: Error executing transformed code:", e);
    }
  }
  
  return cleanedCSS;
}


  function procEv(css) {
  const functionMap = {};
  const funcDefRegex = /@event\s+([\w-]+)\(([^)]*)\)\s*:?{/g;
  let funcMatch;
  let modifiedCSS = css;
  const removalRanges = [];

  // First pass: extract and mark function definitions
  while ((funcMatch = funcDefRegex.exec(css)) !== null) {
    const funcName = funcMatch[1];
    const argsStr = funcMatch[2];
    const blockStart = funcMatch.index + funcMatch[0].length - 1;

    if (blockStart >= css.length) {
      console.warn(`fscss[parsing] Warning: Unexpected end of CSS after @event ${funcName} definition.`);
      continue;
    }

    const fullBlock = extractBlock(css, blockStart);

    if (fullBlock.length === 0 || fullBlock[fullBlock.length - 1] !== '}') {
      console.warn(`fscss[parsing] Warning: Malformed block for @event '${funcName}'. Missing closing '}'.`);
      continue;
    }

    const fullFunc = css.slice(funcMatch.index, blockStart + fullBlock.length);

    const conditionBlocks = parseConditionBlocks(fullBlock);
    const args = argsStr.split(',').map(arg => arg.trim()).filter(arg => arg !== '');

    if (functionMap[funcName]) {
        console.warn(`fscss[definition] Warning: Duplicate @event definition for '${funcName}'. The last one will be used.`);
    }
    functionMap[funcName] = { args, conditionBlocks };

    removalRanges.push([funcMatch.index, blockStart + fullBlock.length]);
  }
  for (let i = removalRanges.length - 1; i >= 0; i--) {
    const [start, end] = removalRanges[i];
    modifiedCSS = modifiedCSS.slice(0, start) + modifiedCSS.slice(end);
  }
  modifiedCSS = modifiedCSS.replace(/@event\.([\w-]+)\(([^)]*)\)/g, (match, funcName, argValuesStr) => {
    const func = functionMap[funcName];
    if (!func) {
      console.warn(`fscss[call] Warning: @event function '${funcName}' not found during call.`);
      return match;
    }

    const context = {};
    const argValues = argValuesStr.split(',').map(v => v.trim()).filter(v => v !== '');

    if (argValues.length !== func.args.length) {
      console.warn(`fscss[call] Warning: Argument count mismatch for @event '${funcName}'. Expected ${func.args.length}, got ${argValues.length}.`);
    }

    func.args.forEach((argName, i) => {
      if (argValues[i] !== undefined) {
        context[argName] = argValues[i];
      } else {
        console.warn(`fscss[call] Warning: Missing value for argument '${argName}' in @event '${funcName}' call.`);
      }
    });

    let result = '';
    let matched = false;
    let elBlockFound = false;

    for (const block of func.conditionBlocks) {
      if (block.type === 'el') {
          if (elBlockFound) {
              console.warn(`fscss[logic] Warning: Multiple 'el' (else) blocks found in @event '${funcName}'. Only the first 'el' block will be considered.`);
          }
          elBlockFound = true;
      }

      if (matched && block.type !== 'el') {
          continue;
      }

      if (block.type === 'el') {
        if (!matched) {
          matched = true;
        } else {
            continue;
        }
      } else {
        const conditions = block.condition.split(',').map(c => c.trim()).filter(c => c !== '');
        if (conditions.length === 0) {
            console.warn(`fscss[logic] Warning: Empty condition in '${block.type}' block for @event '${funcName}'.`);
            matched = true;
        } else {
            matched = conditions.every(cond => {
                const comparisonMatch = cond.match(/^(\w+)\s*(==|!=|>=|<=|>|<)\s*([^]+)$/);
                if (comparisonMatch) {
                    const [, varName, operator, expected] = comparisonMatch;
                    if (!(varName in context)) {
                        console.warn(`fscss[logic] Warning: Condition variable '${varName}' not provided in @event '${funcName}' context. Treating as false.`);
                        return false;
                    }
                    const actual = context[varName];
                    
                    const numActual = isNaN(actual) ? actual : Number(actual);
                    const numExpected = isNaN(expected) ? expected : Number(expected);
                    switch (operator) {
                        case '==': return numActual == numExpected;
                        case '!=': return numActual != numExpected;
                        case '>': return numActual > numExpected;
                        case '<': return numActual < numExpected;
                        case '>=': return numActual >= numExpected;
                        case '<=': return numActual <= numExpected;
                        default: return false;
                    }
                } else {
                    const parts = cond.split(':').map(s => s.trim());
                    if (parts.length !== 2) {
                        console.warn(`fscss[logic] Warning: Malformed condition '${cond}' in @event '${funcName}'. Expected 'variable operator value' or 'variable:value'.`);
                        return false;
                    }
                    const [varName, expected] = parts;
                    if (!(varName in context)) {
                        console.warn(`fscss[logic] Warning: Condition variable '${varName}' not provided in @event '${funcName}' context. Treating as false.`);
                        return false;
                    }
                    return context[varName] === expected;
                }
            });
        }
      }

      if (matched) {
        const assignMatch = block.block.match(/(\w+)\s*(?:\:\s*([^;]*);?|\|([^\|]+)\|?)/);
        if (assignMatch && assignMatch[2]) {
          result = assignMatch[2].trim();
        } 
        else if (assignMatch && assignMatch[3]) {
          result = assignMatch[3].trim();
        }
        else {
          console.warn(`fscss[logic] Warning: No valid CSS property assignment found in matched block for @event '${funcName}'. Block content: '${block.block}'.`);
        }
        break;
      }
    }
    
    
    if (!result && func.conditionBlocks.length > 0 && !matched) {
        console.warn(`fscss[call] Warning: No condition matched for @event '${funcName}' with provided arguments. Returning original call string.`);
    } else if (!result && func.conditionBlocks.length === 0) {
        console.warn(`fscss[definition] Warning: @event '${funcName}' has no condition blocks defined. Returning original call string.`);
    }

    return result || match;
  });

  return modifiedCSS.trim();
}
function initlibraries(css){
  css = css.replace(/exec\(\s*_init\sisjs\s*\)/g, "exec(https://cdn.jsdelivr.net/gh/fscss-ttr/FSCSS@main/xf/styles/isjs.fscss)");
  css = css.replace(/exec\(\s*_init\sthemes\s*\)/g, "exec(https://cdn.jsdelivr.net/gh/fscss-ttr/FSCSS@main/xf/styles/trshapes.fthemes.fscss)")
  css = css.replace(/exec\(_init\sarray1to500\s*\)/g, "exec(https://cdn.jsdelivr.net/gh/fscss-ttr/FSCSS@main/xf/styles/1to500.fscss)");
   return css;
}
function procVar(vcss) {
  function processSCSS(scssCode) {
    const globalVars = {};
    const processedLines = [];
    const lines = scssCode.split('\n');

    let inBlock = false;
    const blockVars = {};

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (line.includes('{')) {
        inBlock = true;
        processedLines.push(line);
        continue;
      }

      if (line.includes('}')) {
        inBlock = false;
        for (const varName in blockVars) {
          delete blockVars[varName];
        }
        processedLines.push(line);
        continue;
      }

      const varDeclarationRegex = /^\s*\$([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/;
      const varMatch = line.match(varDeclarationRegex);

      if (varMatch) {
        const [, varName, varValue] = varMatch;
        if (inBlock) {
          blockVars[varName] = varValue.trim();
          // Do not include block-scoped declarations in the final CSS
        } else {
          globalVars[varName] = varValue.trim();
          // Include global variable declarations in the final CSS
          processedLines.push(line);
        }
        continue;
      }

      const varUsageRegex = /\$\/?([a-zA-Z0-9_-]+)(!)?/g;

      line = line.replace(varUsageRegex, (match, varName) => {
        if (blockVars[varName] !== undefined) {
          return blockVars[varName];
        } else if (globalVars[varName] !== undefined) {
          return globalVars[varName];
        }
        return match;
      });

      processedLines.push(line);
    }

    function getVariable(varName) {
      return globalVars[varName] || null;
    }
    const finalCss = processedLines.join('\n');

    return {
      css: finalCss,
      getVariable
    };
  }

  const result = processSCSS(vcss);
  return result.css;
}

function procExt(css) {
  let extractedVariables = {};
  let tempCSS = css;

  // Step 1: Process string literals
  tempCSS = tempCSS.replace(/("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')/g, function(fullMatch) {
    let quote = fullMatch[0];
    let content = fullMatch.slice(1, -1);
    const directiveRegex = /@ext\((-?\d+),(\d+):\s*([^)]+)\)/g;
    let match;
    let directivesToProcess = [];

    while ((match = directiveRegex.exec(content)) !== null) {
      directivesToProcess.push({
        fullMatch: match[0],
        start: parseInt(match[1]),
        length: parseInt(match[2]),
        varName: match[3].trim(),
        index: match.index
      });
    }

    for (let i = directivesToProcess.length - 1; i >= 0; i--) {
      let d = directivesToProcess[i];
      let s = d.start < 0 ? content.length + d.start : d.start;
      s = Math.max(0, s);
      let extracted = content.substring(s, s + d.length);

      if (s + d.length > content.length || s < 0) {
        console.warn(`fscss:[@ext]Warning: @ext directive for variable '${d.varName}' in string literal specifies an out-of-bounds range. Extraction may be incomplete or incorrect.`);
      }

      if (extractedVariables[d.varName] !== undefined) {
        console.warn(`fscss:[@ext]Warning: Duplicate variable name '${d.varName}' found in string literal. The last extracted value will be used.`);
      }
      extractedVariables[d.varName] = extracted;

      // Remove @ext from content
      content = content.slice(0, d.index) + content.slice(d.index + d.fullMatch.length);
    }

    return quote + content + quote;
  });

  // Step 2: Outside strings
  tempCSS = tempCSS.replace(/([#.\w-]+)\s*@ext\((-?\d+),(\d+):\s*([^)]+)\)/g, function(match, token, start, len, varName) {
    start = parseInt(start);
    len = parseInt(len);
    varName = varName.trim();
    let s = start < 0 ? token.length + start : start;
    s = Math.max(0, s);
    let extracted = token.substring(s, s + len);

    if (s + len > token.length || s < 0) {
      console.warn(`fscss:[@ext]Warning: @ext directive for variable '${varName}' on token '${token}' specifies an out-of-bounds range. Extraction may be incomplete or incorrect.`);
    }

    if (extractedVariables[varName] !== undefined) {
      console.warn(`fscss:[@ext]Warning: Duplicate variable name '${varName}' found outside string literals. The last extracted value will be used.`);
    }
    extractedVariables[varName] = extracted;
    return token;
  });

  // Step 3: Replace @ext.varName references
  tempCSS = tempCSS.replace(/@ext\.(\w+)\!?/g, function(match, varName) {
    if (extractedVariables[varName] === undefined) {
      console.warn(`fscss:[@ext]Warning: Reference to undefined variable '@ext.${varName}'. It will not be replaced.`);
      return match;
    }
    return extractedVariables[varName];
  });

  return tempCSS;
}


function procRan(input) {
  return input.replace(/@random\(\[([^\]]+)\](?:, *ordered)?\)/g, (match, valuesStr) => {
    const isOrdered = /, *ordered\)/.test(match);
    const values = valuesStr.split(',').map(v => v.trim());
    
    if (values.length === 0) {
      console.warn("fscss[@random] Warning: Empty array provided for @random. Returning empty string.");
      return '';
    }
    
    if (isOrdered) {
      // Create consistent key for value sequences
      const sequenceKey = values.join(':');
      
      if (!orderedxFscssRandom[sequenceKey]) {
        orderedxFscssRandom[sequenceKey] = {
          values,
          index: 0,
        };
        console.warn(`fscss[@random] Warning: New ordered sequence created for [${valuesStr}].`);
      }
      
      const store = orderedxFscssRandom[sequenceKey];
      const val = store.values[store.index % store.values.length];
      
      if (store.index >= store.values.length && store.index % store.values.length === 0) {
        console.warn(`fscss[@random] Warning: Ordered sequence [${valuesStr}] is looping back to the beginning.`);
      }
      
      store.index++;
      return val;
    } else {
      // Regular random selection
      const randIndex = Math.floor(Math.random() * values.length);
      return values[randIndex];
    }
  });
}
function procArr(input) {
  // 1. Parse array declarations
  const arrayDeclarationRegex = /@arr\(?\s*([\w\-_—0-9]+)\)?\[([^\]]+)\]\)?/g;
  let match;
  while ((match = arrayDeclarationRegex.exec(input)) !== null) {
    const arrayName = match[1];
    const arrayValues = match[2].split(',').map(item => item.trim());
    arraysExfscss[arrayName] = arrayValues;
  }
  
  let output = input;
  
  // 2. Process loops using @arr.name[]
  output = output.replace(/([^\{\}]+)\{\s*([^}]*@arr\.([\w\-_—0-9]+)\[\][^}]*)\s*\}/g,
    (fullMatch, selector, content, arrayName) => {
      const arr = arraysExfscss[arrayName];
      if (!arr) {
        console.warn(`fscss[@arr] Warning: Array '${arrayName}' not found for loop processing.`);
        return fullMatch;
      }
      
      return arr.map((value, index) => {
        const sel = selector.replace(new RegExp(`@arr\\.${arrayName}\\[\\]`, 'g'), index + 1);
        const body = content.replace(new RegExp(`@arr\\.${arrayName}\\[\\]`, 'g'), value);
        return `${sel.trim()} {\n  ${body.trim()}\n}`;
      }).join('\n');
    });
  
  // 3. Specific array access: @arr.name[index]
  output = output.replace(/@arr\.([\w\-_—0-9]+)\[(\d+)\]/g,
    (fullMatch, arrayName, index) => {
      const idx = parseInt(index) - 1;
      const arr = arraysExfscss[arrayName];
      if (!arr) {
        console.warn(`fscss[@arr] Warning: Array '${arrayName}' not found.`);
        return fullMatch;
      }
      return arr[idx] !== undefined ? arr[idx] : fullMatch;
    });
  
  // 4. Direct array access: @arr.name or @arr.name(separator)
  output = output.replace(/@arr\.([\w\-_—0-9]+)(?:\(([^)]*)\))?/g,
    (fullMatch, arrayName, separator) => {
      const arr = arraysExfscss[arrayName];
      if (!arr) {
        console.warn(`fscss[@arr] Warning: Array '${arrayName}' not found for direct access.`);
        return fullMatch;
      }
      const sep = (separator !== undefined && separator !== "") ? separator : ' ';
      return arr.join(sep);
    });
  
  // 5. Clean up array declarations
  return output
    .replace(arrayDeclarationRegex, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
function procFun(code) {
  const variables = {};

  function parseStyle(styleStr) {
    const props = {};
    const lines = styleStr.split(';');
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) {
        console.warn(`fscss[@fun] Invalid style line (missing colon): "${line}"`);
        continue;
      }
      const prop = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 1).trim();
      if (prop) {
        props[prop] = value;
      } else {
        console.warn(`fscss[@fun] Empty property name in line: "${line}"`);
      }
    }
    return props;
  }

  const funRegex = /@fun\(([\w\-\_\—0-9]+)\)\s*\{([\s\S]*?)\}\s*/g;
  let funMatch;
  while ((funMatch = funRegex.exec(code)) !== null) {
    const varName = funMatch[1];
    const rawStyles = funMatch[2].trim();
    if (variables[varName]) {
      console.warn(`fscss[@fun] Duplicate @fun variable declaration: "${varName}". The last one will overwrite previous declarations.`);
    }
    variables[varName] = {
      raw: rawStyles,
      props: parseStyle(rawStyles)
    };
  }

  let processedCode = code;

  // Handle value extraction (e.g., @fun.varname2.bg.value)
  processedCode = processedCode.replace(/@fun\.([\w\-\_\—0-9]+)\.([\w\-\_\—0-9]+)\.value\!?/g, (match, varName, prop) => {
    if (variables[varName] && variables[varName].props[prop]) {
      return variables[varName].props[prop];
    } else {
      console.warn(`fscss[@fun] Value extraction failed for "@fun.${varName}.${prop}.value". Variable or property not found.`);
    }
    return match;
  });

  // Handle single property rule (e.g., @fun.varname2.background)
  processedCode = processedCode.replace(/@fun\.([\w\-\_\—0-9]+)\.([\w\-\_\—0-9]+)\!?/g, (match, varName, prop) => {
    if (variables[varName] && variables[varName].props[prop]) {
      return `${prop}: ${variables[varName].props[prop]};`;
    } else {
      console.warn(`fscss[@fun] Single property rule failed for "@fun.${varName}.${prop}". Variable or property not found.`);
    }
    return match;
  });

  // Handle full variable block (e.g., @fun.varname2)
  processedCode = processedCode.replace(/@fun\.([\w\-\_\—0-9]+)(?=[\s;}])\!?/g, (match, varName) => {
    if (variables[varName]) {
      return variables[varName].raw;
    } else {
      console.warn(`[@fun] Full variable block replacement failed for "@fun.${varName}". Variable not found.`);
    }
    return match;
  });

  // Clean up code
  processedCode = processedCode.replace(/@fun\(([\w\-\_\d\—]+)\s*\{[\s\S]*?\}\s*/g, '');
  processedCode = processedCode.replace(/^\s*[\r\n]/gm, '');
  processedCode = processedCode.trim();

  return processedCode;
}

// Extracts values using copy() and creates CSS custom properties
function flattenNestedCSS(css, options = {}) {
  const {
    preserveComments = false,
    indent = '  ',
    validate = true,
    errorHandler = (msg) => console.warn(msg),
  } = options;

  // Remove comments unless preserved
  if (!preserveComments) {
    css = css.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  }

  function isValidSelector(selector) {
    // Allow modern CSS features (:has(), > selector, etc.)
    return selector && selector.trim() !== '' && 
           !/[^a-zA-Z0-9\-_@*.\#:,\s>&~+()\[\]'"]|\/\//.test(selector);
  }

  function isValidProperty(prop) {
    const [name, ...rest] = prop.split(':').map(s => s.trim());
    return !validate || /^(--|[\w-]+)$/.test(name);
  }

  function parseBlock(css, start, parentSelector = '') {
    let output = '';
    let pos = start;
    const stack = [];
    let current = '';
    let inString = false;
    let quote = null;
    let depth = 0;

    while (pos < css.length) {
      const char = css[pos];
      
      if (char === '\\' && inString) {
        current += char;
        pos++;
        if (pos < css.length) {
          current += css[pos];
        }
        pos++;
        continue;
      }
      
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        quote = char;
        current += char;
      } else if (char === quote && inString) {
        inString = false;
        quote = null;
        current += char;
      } else if (char === '{' && !inString) {
        if (depth === 0) {
          const selector = current.trim();
          current = '';
          stack.push({ selector, parent: parentSelector });
        } else {
          current += char;
        }
        depth++;
      } else if (char === '}' && !inString) {
        depth--;
        if (depth === 0) {
          const block = stack.pop();
          if (!block) continue;
          
          let fullSelector = '';
          if (block.selector.includes('&')) {
            fullSelector = block.selector.replace(/&/g, block.parent);
          } else {
            fullSelector = block.parent ? `${block.parent} ${block.selector}` : block.selector;
          }
          
          // Parse nested content
          const nested = parseNestedContent(current, fullSelector);
          
          if (nested.properties.length > 0 || nested.keyframes.length > 0) {
            output += `${fullSelector} {\n`;
            if (nested.properties.length > 0) {
              output += indent + nested.properties.join(`;\n${indent}`) + ';\n';
            }
            output += nested.keyframes.join('\n');
            output += '}\n\n';
          }
          
          output += nested.nestedBlocks;
          current = '';
        } else {
          current += char;
        }
      } else if (char === '@' && !inString && depth === 0) {
        // Handle at-rules at root level
        const atRuleEnd = findAtRuleEnd(css, pos);
        if (atRuleEnd === -1) break;
        
        output += css.substring(pos, atRuleEnd).trim() + '\n\n';
        pos = atRuleEnd;
        continue;
      } else {
        current += char;
      }
      
      pos++;
    }

    return { output, pos };
  }

  function findAtRuleEnd(css, start) {
    let depth = 0;
    let inString = false;
    let quote = null;
    let pos = start;
    
    while (pos < css.length) {
      const char = css[pos];
      
      if (char === '\\' && inString) {
        pos += 2;
        continue;
      }
      
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        quote = char;
      } else if (char === quote && inString) {
        inString = false;
        quote = null;
      } else if (char === '{' && !inString) {
        depth++;
      } else if (char === '}' && !inString) {
        depth--;
        if (depth === 0) {
          return pos + 1;
        }
      }
      
      pos++;
    }
    
    return -1;
  }

  function parseNestedContent(content, parentSelector) {
    const result = {
      properties: [],
      nestedBlocks: '',
      keyframes: []
    };
    
    let current = '';
    let inString = false;
    let quote = null;
    let depth = 0;
    let pos = 0;
    
    while (pos < content.length) {
      const char = content[pos];
      
      if (char === '\\' && inString) {
        current += char;
        pos++;
        if (pos < content.length) {
          current += content[pos];
        }
        pos++;
        continue;
      }
      
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        quote = char;
        current += char;
      } else if (char === quote && inString) {
        inString = false;
        quote = null;
        current += char;
      } else if (char === '{' && !inString) {
        depth++;
        current += char;
      } else if (char === '}' && !inString) {
        depth--;
        current += char;
        if (depth === 0) {
          // Found a complete nested block
          const block = parseBlock(current, 0, parentSelector).output;
          result.nestedBlocks += block;
          current = '';
        }
      } else if (char === ';' && !inString && depth === 0) {
        // Property handling
        const prop = current.trim();
        if (prop) {
          if (isValidProperty(prop)) {
            result.properties.push(prop);
          } else if (validate) {
            errorHandler(`Invalid property: ${prop}`);
          }
        }
        current = '';
      } else if (char === '@' && !inString && depth === 0) {
        // Handle keyframes inside blocks
        const atEnd = findAtRuleEnd(content, pos);
        if (atEnd === -1) break;
        
        const atContent = content.substring(pos, atEnd);
        result.keyframes.push(atContent.trim());
        pos = atEnd;
        current = '';
        continue;
      } else {
        current += char;
      }
      
      pos++;
    }
    
    // Handle trailing property
    const lastProp = current.trim();
    if (lastProp && depth === 0) {
      if (isValidProperty(lastProp)) {
        result.properties.push(lastProp);
      } else if (validate) {
        errorHandler(`Invalid property: ${lastProp}`);
      }
    }
    
    return result;
  }

  const result = parseBlock(css, 0);
  return result.output;
}
function procP(text) {
  return text.replace(/%(\d+)\(([^[]+)\[\s*([^\]]+)\]\)/g, (match, number, properties, value) => {
    const propList = properties.split(',').map(p => p.trim());
    if (propList.length != number) {
      console.warn(`Number of properties ${propList.length} does not match %${number}`);
      return match;
    }
    return propList.map(prop => `${prop}${value}`).join("");
  });
}

function transformCssValues(css) {
  const customProperties = new Set();
  const copyRegex = /(:\s*)(["']?)(.*?)(["']?)\s*copy\(([-]?\d+),\s*([^\;^\)^\(^,^ ]*)\)/g;
  
  const transformedCss = css.replace(copyRegex, (match, prefix, quote1, value, quote2, lengthStr, variableName) => {
    const length = parseInt(lengthStr);
    const sanitizedVar = variableName.replace(/[^a-zA-Z0-9_-]/g, '');
    let extractedValue = '';

    if (length >= 0) {
      extractedValue = value.substring(0, length);
    } else {
      extractedValue = value.substring(value.length + length);
    }

    customProperties.add(`--${sanitizedVar}:${extractedValue};`);
    return `${prefix}${quote1}${value}${quote2}`;
  });

  // Append custom properties to :root if any were created
  if (customProperties.size > 0) {
    const rootBlock = `:root{${Array.from(customProperties).join('\n')}\n}`;
    return transformedCss + `\n${rootBlock}`;
  }
  return transformedCss;
}

// Repeats a string while handling quotes
function repeatString(str, count) {
  return str.replace(/^['"]|['"]$/g, '').repeat(Math.max(0, parseInt(count)));
}

// Processes recursive CSS patterns (re() function)
function replaceRe(css) {
  // Enhanced regex to capture re() declarations with flexibility
 const reRegex = /(?:store|str|re)\(\s*([^:,]+)\s*[,:]\s*(?:"([^"]*)"|'([^']*)')\s*\)/gi;
  const variableMap = new Map();
  
  // Step 1: Remove re() declarations and store variable-value mappings
  let cleanedCss = css.replace(reRegex, (match, variable, dqValue, sqValue) => {
    const value = dqValue || sqValue;
    variable = variable.trim();
    variableMap.set(variable, value);
    return ''; // Completely remove the re() call
  });

  // If no variables found, return cleaned CSS
  if (variableMap.size === 0) return cleanedCss;

  // Step 2: Replace variables throughout the CSS
  let changed;
  let iterations = 0;
  const maxIterations = 100;
  let current = cleanedCss;
  
  do {
    changed = false;
    for (const [variable, value] of variableMap.entries()) {
      // Use word boundaries to avoid partial replacements
      const varRegex = new RegExp(`\\b${escapeRegExp(variable)}\\b`, 'g');
      const newCss = current.replace(varRegex, value);
      
      if (newCss !== current) {
        changed = true;
        current = newCss;
      }
    }
    iterations++;
  } while (changed && iterations < maxIterations);

  if (iterations >= maxIterations) {
    console.warn('Maximum iterations reached. Possible circular dependency.');
  }

  return current;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}|[\]\\]/g, '\\$&');
}


// Applies all FSCSS transformations to CSS content
function applyFscssTransformations(css) {
    // Handle mx/mxs padding shorthands
    css = css.replace(/(?:mxs|\$p)\((([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,\s*)?("([^"]*)"|'([^']*)')\)/gi, '$2:$14$15;$4:$14$15;$6:$14$15;$8:$14$15;$10:$14$15;$12:$14$15;')
    .replace(/(?:mx|\$m)\((([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,)?(([^\,]*)\,\s*)?("([^"]*)"|'([^']*)')\)/gi, '$2$14$15$4$14$15$6$14$15$8$14$15$10$14$15$12$14$15')
    
    // Handle string repetition (rpt)
    .replace(/rpt\((\d+)\,\s*("([^"]*)"|'([^']*)')\)/gi, (match, count, quotedStr) => repeatString(quotedStr, count))
    
    // Process CSS variable declarations and references
    .replace(/\$(([\_\-\d\w]+)\:(\"[^\"]*\"|\'[^\']*\'|[^\;]*)\;)/gi, ':root{--$1}')
    .replace(/\$([^\!\s]+)!/gi, 'var(--$1)')
    .replace(/\$([\w\-\_\d]+)/gi, 'var(--$1)')
    
    // Handle vendor prefix expansion
  .replace(/\-\*\-(([^\:]+)\:(\"[^\"]*\"|\'[^\']*\'|[^\;]*)\;)/gi, '-webkit-$1-moz-$1-ms-$1-o-$1')
  // Process list-based shorthands (%i, %6-%1)
  .replace(/%i\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\]\[]*)\,)?(([^\,\]\[]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$21$4$21$6$21$8$21$10$21$12$21$14$21$16$21$18$21$20$21')
    .replace(/%6\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\]\[]*)\,)?(([^\,\]\[]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$13$4$13$6$13$8$13$10$13$12$13')
    .replace(/%5\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\]\[]*)\,)?(([^\,\]\[]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$11$4$11$6$11$8$11$10$11')
    .replace(/%4\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$9$4$9$6$9$8$9')
    .replace(/%3\((([^\,\[\]]*)\,)?(([^\,\[\]]*)\,)?(([^\,\[\]]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$7$4$7$6$7')
    .replace(/%2\((([^\,\[\]]*)\,)?(([^\,\]\[]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$5$4$5')
    .replace(/%1\((([^\,\]\[]*))?\s*\[([^\]\[]*)\]\)/gi, '$2$3');
  css = procP(css);
    css = css.replace(/\$\(\s*@keyframes\s*(\S+)\)/gi, '$1{animation-name:$1;}@keyframes $1')
    .replace(/\$\(\s*(\@[\w\-\*]*)\s*([^\{\}\,&]*)(\s*,\s*[^\{\}&]*)?&?(\[([^\{\}]*)\])?\s*\)/gi, '$2$3{animation:$2 $5;}$1 $2')
    
    // Process property references
    .replace(/\$\(\s*--([^\{\}]*)\)/gi, '$1')
    .replace(/\$\(([^\:]*):\s*([^\)\:]*)\)/gi, '[$1=\'$2\']')
    
    // Handle grouping syntax (g)
    .replace(/g\(([^"'\s]*)\,\s*(("([^"]*)"|'([^']*)')\,\s*)?("([^"]*)"|'([^']*)')\s*\)/gi, '$1 $4$5$1 $7$8')
    .replace(/\$\(([^\:]*):\s*([^\)\:]*)\)/gi, '[$1=\'$2\']')
    .replace(/\$\(([^\:^\)]*)\)/gi, '[$1]');
  return css;
}
async function impSel(text) {
  const validImpExt = [".fscss", ".css", ".txt", ".scss", ".less", "xfscss"]
  const regex = /@import\(exec\(([^)]+)\)\s*\.\s*(?:pick|find)\(([^)]+)\)\)/g;
  const matches = [...text.matchAll(regex)];
  
  let result = text;
  
  for (const match of matches) {
    const [fullMatch, urlSrc, part] = match;
    try {
      const impUrl = urlSrc.replace(/["']/g, "");
      const impExt = impUrl.slice(impUrl.lastIndexOf(".")).toLowerCase();
      if (impUrl.trim().startsWith("_init") && impUrl.includes(" ")) {
        console.warn(`fscss[@import] library not found for: ${impUrl}`);
        return;
      }
      
      if (!validImpExt.includes(impExt)) {
        console.warn(`fscss[@import] invalid extension for: ${impUrl}`);
        return;
      }
      
      const response = await fetch(impUrl);
      if (!response.ok) throw new Error(`fscss[@import] HTTP ${response.status} for ${urlSrc}`);
      const resText = await response.text();
      const extracted = extractOnlyBlock(resText, part.trim());
      result = result.replace(fullMatch, extracted);
    } catch (err) {
      console.error(`fscss[@import]  Failed: ${urlSrc} `, err);
      result = result.replace(fullMatch, `/* Failed import: ${urlSrc} */`);
      
    }
  }
  
  return result;
}

function extractOnlyBlock(cssText, blockName) {
  const regex = new RegExp(`${blockName}\\s*{[^}]*}`, "g");
  const match = cssText.match(regex);
  return match ? match.join("\n") : console.warn(`fscss[@import pick] No block matches: ${blockName} `);
}

const VALID_EXTENSIONS = ['.fscss', '.css', '.txt', '.scss', '.less', '.xfscss'];

async function processImports(cssText, depth = 0, baseURL = window.location.href) {
  if (depth > exfMAX_DEPTH) {
    console.warn('fscss[@import]\n Maximum import depth exceeded. Skipping further imports.');
    return cssText;
  }

  const importRegex = /@import\s*\(\s*exec\s*\(\s*((?:'[^']*'|"[^"]*"|[^'")]\S*)\s*)\)\s*\)/g;
  const matches = Array.from(cssText.matchAll(importRegex));

  if (matches.length === 0) return cssText;

  const fetchedContents = await Promise.all(
    matches.map(async (match) => {
      const [fullMatch, urlSpec] = match;
      try {
        const cleanUrl = urlSpec.replace(/^['"](.*)['"]$/, '$1').trim();
        const absoluteUrl = new URL(cleanUrl, baseURL).href;

        // --- New code for extension validation ---
        const urlPath = new URL(absoluteUrl).pathname;
        const extension = urlPath.slice(urlPath.lastIndexOf('.')).toLowerCase();
        
 if (absoluteUrl.trim().startsWith("_init") && absoluteUrl.includes(" ")){
        console.warn(`fscss[@import] library not found for: ${absoluteUrl}`);
        return;
      }
      
        if (!VALID_EXTENSIONS.includes(extension)) {
          console.warn(`fscss[@import] \n Invalid import URL extension "${extension}" for "${absoluteUrl}". Only ${VALID_EXTENSIONS.join(', ')} are allowed.`);
          return `/* Invalid extension for "${absoluteUrl}" */`;
        }
        // --- End of new code ---

        const response = await fetch(absoluteUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status} for ${absoluteUrl}`);

        const importedText = await response.text();
        return processImports(importedText, depth + 1, absoluteUrl);
      } catch (error) {
        console.warn(`fscss[@import]\n Failed to import "${urlSpec}" from "${baseURL}":`, error);
        return `/* Error importing "${urlSpec}": ${error.message} */`;
      }
    })
  );

  let lastIndex = 0;
  let result = '';
  matches.forEach((match, i) => {
    result += cssText.slice(lastIndex, match.index);
    result += fetchedContents[i];
    lastIndex = match.index + match[0].length;
  });
  result += cssText.slice(lastIndex);

  return result;
}

async function procImp(css) {
  try {
    const processedCSS = await processImports(css);
    return processedCSS;
  } catch (error) {
    console.warn('fscss[]\n Processing failed:', error);
    console.warn(`fscss[@import] Warning: can't resolve imports`);
    return css; 
  }
}

function execObj(css){
  return css.replace(/exec\.obj\.block\([^\)\n]*\)\;?/g, "");
}

    export { initlibraries, 
    impSel, procImp, replaceRe, procExt, procVar,procFun, procArr, procEv, procRan, transformCssValues, procNum,applyFscssTransformations,procExC, execObj
    } 
    
