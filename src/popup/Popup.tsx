// function Popup() {
//   return <div>Hello from React Popup!</div>
// }

// export default Popup

import ReactDOM from 'react-dom/client';
import '../index.css';

function Popup() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-[#FEF9EE] w-[200px] h-[200px] flex items-center justify-center">
        Hello from React Popup!
      </div>
    </div>
  );
}

export default Popup;

// Mounting the Popup
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Popup />);
