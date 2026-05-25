import { Loader2 } from 'lucide-react';
import './PageLoader.css';

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="page-loader-container">
      <div className="page-loader-content">
        <Loader2 className="spinner" size={40} />
        <p>{message}</p>
      </div>
    </div>
  );
}
