// pages/index.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import Fuse from "fuse.js";
import { db } from "../lib/firebase";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { normalize } from "@/utils/normalize";

interface Equipment {
  id: string;
  equipment_name: string;
  normalizedName: string;
  category: string;
  rental_company: string;
  price_per_day: number;
}

interface CartItem {
  id: string;
  equipment_name: string;
  category: string;
  rental_company: string;
  price_per_day: number;
  quantity: number;
  discount?: number;
  discountType?: "percent" | "fixed";
}

const debounce = <T extends (...args: any[]) => void>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Filters = ({
  categories,
  rentals,
  selectedCategories,
  selectedRentals,
  toggleCategory,
  toggleRental,
  resetFilters,
}: {
  categories: string[];
  rentals: string[];
  selectedCategories: string[];
  selectedRentals: string[];
  toggleCategory: (category: string) => void;
  toggleRental: (rental: string) => void;
  resetFilters: () => void;
}) => {
  const categoryRef = useRef<HTMLDivElement>(null);
  const rentalRef = useRef<HTMLDivElement>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showRentals, setShowRentals] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [rentalSearch, setRentalSearch] = useState("");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setShowCategories(false);
      }
      if (rentalRef.current && !rentalRef.current.contains(e.target as Node)) {
        setShowRentals(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {/* Ренталы */}
      <div className="relative" ref={rentalRef}>
        <button
          onClick={() => setShowRentals(v => !v)}
          className="border px-3 py-2 rounded bg-white hover:bg-gray-100"
        >
          Ренталы ▾
        </button>
        {showRentals && (
          <div className="absolute bg-white shadow rounded mt-1 z-10 p-2 max-h-60 overflow-y-auto w-48">
            <input
              type="text"
              placeholder="Поиск рентала..."
              className="mb-2 px-2 py-1 border rounded w-full text-sm"
              onChange={e => setRentalSearch(e.target.value.toLowerCase())}
            />
            {rentals
              .filter(r => r.toLowerCase().includes(rentalSearch))
              .map(r => (
                <label key={r} className="block text-sm">
                  <input
                    type="checkbox"
                    checked={selectedRentals.includes(r)}
                    onChange={() => toggleRental(r)}
                    className="mr-2"
                  />
                  {r}
                </label>
              ))}
          </div>
        )}
      </div>

      {/* Категории */}
      <div className="relative" ref={categoryRef}>
        <button
          onClick={() => setShowCategories(v => !v)}
          className="border px-3 py-2 rounded bg-white hover:bg-gray-100"
        >
          Категории ▾
        </button>
        {showCategories && (
          <div className="absolute bg-white shadow rounded mt-1 z-10 p-2 max-h-60 overflow-y-auto w-48">
            <input
              type="text"
              placeholder="Поиск категории..."
              className="mb-2 px-2 py-1 border rounded w-full text-sm"
              onChange={e => setCategorySearch(e.target.value.toLowerCase())}
            />
            {categories
              .filter(cat => cat.toLowerCase().includes(categorySearch))
              .map(cat => (
                <label key={cat} className="block text-sm">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="mr-2"
                  />
                  {cat}
                </label>
              ))}
          </div>
        )}
      </div>

      <button
        onClick={resetFilters}
        className="border px-3 py-2 rounded bg-white hover:bg-gray-100"
      >
        Сбросить фильтры
      </button>
    </div>
  );
};

export default function Home() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRentals, setSelectedRentals] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const snap = await getDocs(collection(db, "equipment"));
        const items: Equipment[] = [];
        snap.forEach(doc => {
          const d = doc.data() as any;
          if (
            d.equipment_name &&
            d.category &&
            d.rental_company &&
            typeof d.price_per_day === "number"
          ) {
            items.push({
              id: doc.id,
              equipment_name: d.equipment_name,
              normalizedName: normalize(d.equipment_name),
              category: d.category,
              rental_company: d.rental_company,
              price_per_day: d.price_per_day,
            });
          }
        });
        setEquipment(items);
      } catch (e) {
        console.error(e);
        setError("Не удалось загрузить оборудование. Попробуйте позже.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const stored = localStorage.getItem("smeta-cart");
    if (stored) setCart(JSON.parse(stored));
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    localStorage.setItem("smeta-cart", JSON.stringify(cart));
  }, [cart, cartLoaded]);

  const addToCart = (item: Equipment) => {
    setCart(prev => {
      const exists = prev.find(x => x.id === item.id);
      if (exists) {
        return prev.map(x =>
          x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...prev, { ...item, quantity: 1, discount: 0, discountType: "percent" }];
    });
    setIsAddingToCart(true);
    setTimeout(() => setIsAddingToCart(false), 500);
    setAddedToCart(item.id);
    setTimeout(() => setAddedToCart(null), 1000);
  };

  const categories = useMemo(
    () => Array.from(new Set(equipment.map(i => i.category))),
    [equipment]
  );

  const rentals = useMemo(
    () => Array.from(new Set(equipment.map(i => i.rental_company))),
    [equipment]
  );

  const fuse = useMemo(() => {
    return new Fuse(equipment, {
      keys: ["normalizedName"],
      threshold: 0.3,
      distance: 100,
    });
  }, [equipment]);

  const filtered = useMemo(() => {
    const base = equipment.filter(item => {
      const catOk =
        !selectedCategories.length || selectedCategories.includes(item.category);
      const rentOk =
        !selectedRentals.length || selectedRentals.includes(item.rental_company);
      return catOk && rentOk;
    });

    if (!searchTerm) return base;

    const norm = normalize(searchTerm);
    const exact = base.filter(item => item.normalizedName.includes(norm));
    if (exact.length) return exact;

    return fuse.search(norm).map(r => r.item).filter(i => base.includes(i));
  }, [equipment, searchTerm, selectedCategories, selectedRentals]);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Navbar />

      <div className="mb-6 text-center">
        <img
          src="/setkit-logo.png"
          alt="CrewKit Logo"
          className="mx-auto mb-2 h-16"
        />
        <h1 className="text-3xl font-extrabold">CrewKit</h1>
        <p className="text-gray-600 mt-1">
          Калькулятор смет для съёмочной команды: быстро, удобно, без регистрации
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Выбирайте оборудование, собирайте смету, скачивайте PDF — всё в пару кликов
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <input
        type="text"
        placeholder="Поиск..."
        className="border px-3 py-2 mb-4 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
        onChange={e => debouncedSearch(e.target.value)}
      />

      <Filters
        categories={categories}
        rentals={rentals}
        selectedCategories={selectedCategories}
        selectedRentals={selectedRentals}
        toggleCategory={cat =>
          setSelectedCategories(p =>
            p.includes(cat) ? p.filter(x => x !== cat) : [...p, cat]
          )
        }
        toggleRental={rent =>
          setSelectedRentals(p =>
            p.includes(rent) ? p.filter(x => x !== rent) : [...p, rent]
          )
        }
        resetFilters={() => {
          setSelectedCategories([]);
          setSelectedRentals([]);
          setSearchTerm("");
        }}
      />

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Загрузка оборудования...</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">Ничего не найдено.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map(item => (
            <li
              key={item.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{item.equipment_name}</div>
                <div className="text-sm text-gray-600">
                  {item.category} • {item.rental_company}
                </div>
                <div className="text-sm">{item.price_per_day}₽ / день</div>
              </div>
              <button
                onClick={() => addToCart(item)}
                className={`px-3 py-1 rounded transition-all duration-200 ${
                  addedToCart === item.id
                    ? "bg-green-600 text-white scale-105"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Добавить
              </button>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/cart"
        className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow transition-all duration-300 ${
          cart.length > 0
            ? isAddingToCart
              ? "bg-green-600 text-white scale-105 animate-pulse"
              : "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-blue-300 text-white cursor-not-allowed"
        }`}
      >
        Смета ({cart.length})
      </Link>
    </div>
  );
}
