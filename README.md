# FSCSS
<a href="https://opencollective.com/fscss"><img src="https://i.ibb.co/hFP9xZr8/fscss-icon.jpg" alt="FSCSS Style Sheet" border="0" width="30" height="10"></a>
Figured Shorthand Cascading Style Sheet (FSCSS) 
<br>
<small>
 For simplifying CSS coding by introducing shorthand syntax and variables.
 </small>
 <br>
<b>example usage</b>
<pre><code>
exec({
   type: 'text',
   content: 'body { background: #0%2([f]); }',
   onSuccess: (styleElement) => console.log('CSS applied:', styleElement),
   onError: (msg) => console.warn('Error applying CSS:', msg)
 });
</code>
</pre>
