// overlay.tsx
import ReactDOM from 'react-dom/client';
import Popup from '../popup/Popup';
import '../index.css'; // tailwind 포함

let root: ReactDOM.Root | null = null;
let container: HTMLDivElement | null = null;

function createContainer() {
  container = document.createElement('div');
  container.id = 'extension-overlay-root';
  document.body.appendChild(container);
}

function destroyContainer() {
  if (container) {
    ReactDOM.createRoot(container).unmount();
    container.remove();
    container = null;
    root = null;
  }
}

export function initOverlay() {
  window.addEventListener('extension-toggle-overlay', () => {
    if (!container) {
      createContainer();
      root = ReactDOM.createRoot(container!);
      root.render(
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="absolute inset-0 bg-black opacity-50" onClick={destroyContainer} />
          <Popup onClose={destroyContainer} />
        </div>
      );
    } else {
      destroyContainer();
    }
  });
}
