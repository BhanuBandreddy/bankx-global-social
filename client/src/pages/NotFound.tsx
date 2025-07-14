import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <div className="neo-brutalist bg-white p-8 text-center">
        <h1 className="text-6xl font-black mb-4 text-black uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>404</h1>
        <p className="text-xl text-black font-bold mb-6 uppercase">Page Not Found</p>
        <a href="/" className="neo-brutalist bg-lime-400 text-black px-6 py-3 font-black uppercase inline-block" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
          Return Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
