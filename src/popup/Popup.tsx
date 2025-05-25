// Popup.tsx

type Props = { onClose: () => void };

export default function Popup({ onClose }: Props) {
  return (
    <div className="bg-[#FEF9EE] p-6 rounded-xl shadow-lg flex flex-col items-center">
      <p className="mb-4">Hello from React Popup!</p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={onClose}
      >
        닫기
      </button>
    </div>
  );
}
