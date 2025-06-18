
interface ContextPreviewProps {
  productName?: string;
  price?: string;
  action?: string;
}

export const ContextPreview = ({ productName, price, action }: ContextPreviewProps) => {
  if (!productName) return null;

  return (
    <div className="text-xs text-slate-500 mb-2 px-4 py-2 bg-gray-50 border-2 border-gray-300 rounded">
      Context: {productName} {price && `• ${price}`} {action && `• ${action}`}
    </div>
  );
};
