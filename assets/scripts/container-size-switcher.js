document.addEventListener('DOMContentLoaded', function () {
  const nav = document.getElementById('nav');
  if (!nav) return;

  nav.innerHTML = `
    <fieldset>
      <legend>Canvas/Container Size</legend>
      <select id="canvasSwitcher">
        <option value="mobile" data-size="412">Mobile</option>
        <option value="tablet-small" data-size="768" selected>Tablet (Small)</option>
        <option value="tablet-large" data-size="1024">Tablet (Large)</option>
        <option value="laptop" data-size="1280">Laptop</option>
        <option value="desktop" data-size="1900">Desktop</option>
      </select>
      <div>Current canvas: 
        <span class="currentCanvas" id="currentCanvas">Tablet (Small)</span> 
        <span class="currentCanvasSize" id="currentCanvasSize">768px</span>
      </div>
    </fieldset>
    <fieldset>
      <legend>Toggle Align Centre</legend>
      <input type="checkbox" value="true" id="canvasAlignment" />
      <div>Current alignment: <span class="currentAlignment" id="currentAlignment">Start</span></div>
    </fieldset>
`;

  // Set up event listeners
  const canvasSwitcher = document.getElementById('canvasSwitcher');
  const canvasAlignment = document.getElementById('canvasAlignment');
  const main = document.getElementById('main');
  const currentCanvas = document.getElementById('currentCanvas');
  const currentCanvasSize = document.getElementById('currentCanvasSize');

  // Functions to save preferences to localStorage
  function saveCanvasPreference(canvasValue) {
    localStorage.setItem('preferredCanvas', canvasValue);
  }

  function saveAlignmentPreference(isAlignCenter) {
    localStorage.setItem('preferredAlignment', isAlignCenter ? 'center' : 'start');
  }

  function updateCanvas(event) {
    const selectedElem = canvasSwitcher.querySelector(`[value="${event.target.value}"]`);
    const updatedCanvasStr = selectedElem.textContent;

    if (main) {
      main.dataset.canvas = event.target.value;
    }

    currentCanvas.innerHTML = updatedCanvasStr;
    currentCanvasSize.innerHTML = selectedElem.dataset.size + 'px';

    // Save to localStorage
    saveCanvasPreference(event.target.value);
  }

  function updateAlignment() {
    if (main) {
      main.classList.toggle('alignCenter');
    }

    const currentAlignment = document.getElementById('currentAlignment');
    currentAlignment.innerHTML = canvasAlignment.checked ? 'Center' : 'Start';

    // Save to localStorage
    saveAlignmentPreference(canvasAlignment.checked);
  }

  // Load preferences from localStorage or use defaults
  function loadPreferences() {
    // Load canvas preference
    const savedCanvas = localStorage.getItem('preferredCanvas');
    if (savedCanvas && canvasSwitcher.querySelector(`[value="${savedCanvas}"]`)) {
      canvasSwitcher.value = savedCanvas;

      const selectedElem = canvasSwitcher.querySelector(`[value="${savedCanvas}"]`);
      currentCanvas.innerHTML = selectedElem.textContent;
      currentCanvasSize.innerHTML = selectedElem.dataset.size + 'px';

      if (main) {
        main.dataset.canvas = savedCanvas;
      }
    } else {
      const defaultOption = canvasSwitcher.querySelector('option[selected]');
      if (defaultOption) {
        currentCanvas.innerHTML = defaultOption.textContent;
        currentCanvasSize.innerHTML = defaultOption.dataset.size + 'px';

        if (main) {
          main.dataset.canvas = defaultOption.value;
        }
      }
    }

    // Load alignment preference
    const savedAlignment = localStorage.getItem('preferredAlignment');
    if (savedAlignment) {
      const shouldBeCenter = savedAlignment === 'center';
      canvasAlignment.checked = shouldBeCenter;

      if (main) {
        if (shouldBeCenter) {
          main.classList.add('alignCenter');
        } else {
          main.classList.remove('alignCenter');
        }
      }

      const currentAlignment = document.getElementById('currentAlignment');
      currentAlignment.innerHTML = shouldBeCenter ? 'Center' : 'Start';
    }
  }

  // Initialize with saved preferences
  loadPreferences();

  // Add event listeners
  canvasSwitcher.addEventListener('change', updateCanvas);
  canvasAlignment.addEventListener('change', updateAlignment);

  // Function to remove event listeners when page unloads
  function removeEventListeners() {
    canvasSwitcher.removeEventListener('change', updateCanvas);
    canvasAlignment.removeEventListener('change', updateAlignment);
  }

  // Remove event listeners when page unloads
  window.addEventListener('unload', removeEventListeners);
});
