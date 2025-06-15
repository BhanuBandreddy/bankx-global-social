
import { AuthNavbar } from "./AuthNavbar";

export const Navbar = () => {
  return (
    <nav className="border-b-4 border-white bg-black">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              GLOBAL SOCIAL 🌍
            </h1>
          </div>
          
          <AuthNavbar />
        </div>
      </div>
    </nav>
  );
};
