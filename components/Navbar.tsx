// components/Navbar.tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-6">
      <Link href="/" className="flex items-center space-x-2">
        <img src="/setkit-logo.png" alt="CrewKit" className="h-8" />
        <span className="text-xl font-bold text-gray-800">CrewKit</span>
      </Link>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-700">
        <Link href="/" className="hover:underline font-semibold">Главная</Link>
        <Link href="/cart" className="hover:underline font-semibold">Смета</Link>
        <Link href="/rentals" className="hover:underline font-semibold">Ренталы</Link>
        <Link href="/about" className="hover:underline font-semibold">О проекте</Link>
        <Link href="/support" className="hover:underline font-semibold">Поддержать</Link>
      </div>
    </nav>
  );
}
