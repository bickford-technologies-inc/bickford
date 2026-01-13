// inject.js
// Injects a Bickford panel into ChatGPT UI
(function() {
  if (document.getElementById('bickford-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'bickford-panel';
  panel.style.position = 'fixed';
  panel.style.top = '0';
  panel.style.right = '0';
  panel.style.width = '350px';
  panel.style.height = '100vh';
  panel.style.background = '#fff';
  panel.style.borderLeft = '2px solid #222';
  panel.style.zIndex = '99999';
  panel.style.overflow = 'auto';
  panel.innerHTML = `
    <iframe src="http://localhost:5173" style="width:100%;height:100%;border:none;"></iframe>
    <button id="bickford-close" style="position:absolute;top:8px;left:8px;z-index:100000;">×</button>
  `;
  document.body.appendChild(panel);
  document.getElementById('bickford-close').onclick = () => panel.remove();
})();
