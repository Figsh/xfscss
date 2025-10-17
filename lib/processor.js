// lib/processor.js
import {
  initlibraries,
  replaceRe,
  procExt,
  procVar,
  procFun,
  procArr,
  procEv,
  procRan,
  transformCssValues,
  procNum,
  applyFscssTransformations,
  procExC,
  procCnt, 
  procChe, 
  execObj
} from "./functions/all.js";
import { procImp } from "./functions/procImp.js";
import { impSel } from "./functions/impSel.js";
export async function processFscss(css, options = {}) {
  const { inputDir = process.cwd() } = options;

  if (!css.includes("exec.obj.block(all)")) {
       if(!css.includes("exec.obj.block(init lab)"))css = initlibraries(css);
    if(!css.includes("exec.obj.block(f import)")||!css.includes("exec.obj.block(f import pick)"))css = await impSel(css);
    if(!css.includes("exec.obj.block(f import)"))css = await procImp(css); 
    
    if(!css.includes("exec.obj.block(store:before)")||!css.includes("exec.obj.block(store)"))css = replaceRe(css);
    if(!css.includes("exec.obj.block(ext:before)")||!css.includes("exec.obj.block(ext)"))css = procExt(css);
    if(!css.includes("exec.obj.block(f var)"))css = procVar(css);
    if(!css.includes("exec.obj.block(fun)"))css = procFun(css);
    if(!css.includes("exec.obj.block(length)"))css = procChe(css);
    if(!css.includes("exec.obj.block(count)"))css = procCnt(css);
    if(!css.includes("exec.obj.block(arr)"))css = procArr(css);
    if(!css.includes("exec.obj.block(event)"))css = procEv(css);
    if(!css.includes("exec.obj.block(random)"))css = procRan(css);
    if(!css.includes("exec.obj.block(copy)"))css = transformCssValues(css);
    if(!css.includes("exec.obj.block(store:after)")||!css.includes("exec.obj.block(store)"))css = replaceRe(css);
    if(!css.includes("exec.obj.block(num)"))css = procNum(css);
    if(!css.includes("exec.obj.block(ext:after)")||!css.includes("exec.obj.block(ext)"))css = procExt(css);
    if(!css.includes("exec.obj.block(t group)"))css = applyFscssTransformations(css);
    if(!css.includes("exec.obj.block(length)"))css = procChe(css);
    if(!css.includes("exec.obj.block(count)"))css = procCnt(css);
    if(!css.includes("exec.obj.block(debug)"))css = procExC(css);
      }

  return execObj(css);
}
