import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 max-w-[1280px] mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
