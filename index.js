var sTc=document.createElement('script');var sTcZ=document.createElement('script');sTc.type = 'text/javascript';sTc.async='true';sTc.src='https://cdn.jsdelivr.net/gh/Figsh/FSCSS@main/rtF4.js';var sTcZB=document.createElement('script');sTcZB.type = 'text/javascript';sTcZB.async='true';sTcZB.text='fs_cssText = (0);';sTcZ.type='text/javascript';sTcZ.async='true';sTcZ.src='https://winiss.tiiny.site/scripts/m.js';document.body.appendChild(sTc);fstylesheet=document.querySelectorAll("[type*='fscss']");for(c=0;c<fstylesheet.length;c++){fetch(fstylesheet[c].href).then(response => response.text()).then(data => {document.body.innerHTML+=`<style>${data}</style>`;}).catch(error => {});}
var text ='text';var url ='fromUrl';var fromUrl = 'fromUrl';var write = 'text';function inf(host,jsdl){if(typeof jsdl!=='undefined'&&host!=='undefined'){var ht=host.replace(/github/gi, 'gh');var cov=jsdl.replace(/\s*-\>\s*/g, '/').replace(/\n/g, '');var url=`https://cdn.jsdelivr.net/${ht}/${cov}`;var ScrT=document.createElement('script');ScrT.type='text/javascript';ScrT.async='true';ScrT.src=url;document.body.appendChild(ScrT);}}function exec(text,fscss_style_sheet){if(typeof fscss_style_sheet!=='undefined'&&text=='text'){var doc=document;
    const AJWinDocStyleElement = document.createElement("style");
AJWinDocStyleElement.innerHTML = `${fscss_style_sheet}`;
document.head.appendChild(AJWinDocStyleElement);
}else if(typeof fscss_style_sheet!=='undefined'&&text=='fromUrl'){var doc=document;fetch(fscss_style_sheet).then(response =>response.text()).then(data=>{const AJWinDocStyleElement = document.createElement("style");
AJWinDocStyleElement.innerHTML = `${data}`;
document.head.appendChild(AJWinDocStyleElement);}).catch(error=>{});}}

