import { useNavigate } from 'react-router-dom';

interface BrandProps {
  nameHidden?: boolean;
}

export function Brand({ nameHidden = false }: BrandProps) {
  const navigate = useNavigate();
  return (
    <div
      className="inline-flex items-center gap-2 font-semibold tracking-snug text-question cursor-pointer"
      onClick={() => navigate('/')}
    >
      <span className="w-5.5 h-5.5 rounded-md bg-ink grid place-items-center text-bg font-mono text-label font-bold">S</span>
      {!nameHidden && <span>Smart Form Builder</span>}
    </div>
  );
}
