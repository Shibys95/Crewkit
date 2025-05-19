import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { registerRobotoFont } from "../fonts/registerRobotoFont";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowDownTrayIcon, TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type CartItem = {
  id: string;
  equipment_name: string;
  category: string;
  rental_company: string;
  price_per_day: number;
  quantity: number;
  shifts: number;
  discount: number;
  discountType: "percent" | "fixed";
  discountSource?: 'individual' | 'category' | 'global';
};

const CartItemRow = ({
  item,
  onQuantityChange,
  onShiftsChange,
  onDiscountChange,
  onDiscountTypeToggle,
  onDuplicate,
  onRemove,
}: {
  item: CartItem;
  onQuantityChange: (id: string, value: string) => void;
  onShiftsChange: (id: string, value: string) => void;
  onDiscountChange: (id: string, discount: number) => void;
  onDiscountTypeToggle: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}) => {
  const total = useMemo(() => {
    const raw = item.price_per_day * item.quantity * item.shifts;
    const discountAmt =
      item.discountType === "percent"
        ? (raw * item.discount) / 100
        : item.discount;
    return Math.round(raw - discountAmt);
  }, [item]);

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors duration-200">
      <td className="py-3 px-4 max-w-xs">
        <div 
  className="truncate overflow-hidden text-ellipsis whitespace-nowrap" 
  title={item.equipment_name}
>
  {item.equipment_name}
</div>
      </td>
      <td className="py-3 px-4">{item.rental_company}</td>
      <td className="py-3 px-4">{item.price_per_day}₽</td>
      <td className="py-3 px-4">
        <input
          type="number"
          min={0}
          value={item.quantity}
          onChange={(e) => {
            const value = e.target.value;
            onQuantityChange(item.id, value);
          }}
          className="border border-gray-300 px-2 py-1 rounded w-16 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </td>
      <td className="py-3 px-4">
        <input
          type="number"
          min={0}
          value={item.shifts}
          onChange={(e) => {
            const value = e.target.value;
            onShiftsChange(item.id, value);
          }}
          className="border border-gray-300 px-2 py-1 rounded w-16 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2 items-center relative">
          <input
            type="number"
            min={0}
            max={item.discountType === "percent" ? 100 : undefined}
            value={item.discount}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0 && (item.discountType !== "percent" || value <= 100))
                onDiscountChange(item.id, value);
            }}
            disabled={item.discountSource === "global" || item.discountSource === "category"}
            className={`border border-gray-300 px-2 py-1 rounded w-16 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              item.discountSource === "global" || item.discountSource === "category"
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-white"
            }`}
          />
          {(item.discountSource === "global" || item.discountSource === "category") && (
            <span className="absolute right-10 text-gray-400">🔒</span>
          )}
          <button
            onClick={() => onDiscountTypeToggle(item.id)}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {item.discountType === "percent" ? "%" : "₽"}
          </button>
        </div>
      </td>
      <td className="py-3 px-4 text-right">{total}₽</td>
      <td className="py-3 px-4">
        <button
          onClick={() => onDuplicate(item.id)}
          className="text-blue-600 hover:text-blue-800 mr-2 hover:underline transition-all"
        >
          Дублировать
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-600 hover:text-red-800 hover:underline transition-all"
        >
          Удалить
        </button>
      </td>
    </tr>
  );
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [globalDiscountType, setGlobalDiscountType] = useState<"percent" | "fixed">("percent");
  const [categoryDiscounts, setCategoryDiscounts] = useState<Record<string, number>>({});
  const [gafferName, setGafferName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [comment, setComment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [defaultShifts, setDefaultShifts] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [newServiceType, setNewServiceType] = useState<string>("");
  const [newServicePrice, setNewServicePrice] = useState<number | null>(null);
  const [customServiceName, setCustomServiceName] = useState<string>("");
  const [customServiceCost, setCustomServiceCost] = useState<number | null>(null);

  const serviceOptions = [
    {
      group: "Персонал",
      items: [
        { value: "gaffer", label: "Гаффер (10ч)" },
        { value: "overtime_gaffer", label: "Переработка Гаффера (1ч)" },
        { value: "lighting", label: "Осветитель (10ч)" },
        { value: "overtime_lighting", label: "Переработка Осветителя (1ч)" },
        { value: "key_grip", label: "Key Grip (10ч)" },
        { value: "overtime_key_grip", label: "Переработка Key Grip (1ч)" },
        { value: "assistant", label: "Ассистент (10ч)" },
        { value: "overtime_assistant", label: "Переработка Ассистента (1ч)" },
        { value: "digi_assistant", label: "Ассистент Digital (10ч)" },
        { value: "overtime_digi_assistant", label: "Переработка Ассистента Digital (1ч)" },
        { value: "operator", label: "Пультовик (10ч)" },
        { value: "overtime_operator", label: "Переработка Пультовика (1ч)" },
      ],
    },
    {
      group: "Логистика / Дополнительно",
      items: [
        { value: "delivery", label: "Доставка" },
        { value: "light_base", label: "Светобаза" },
        { value: "taxi", label: "Такси" },
        { value: "taxi_day", label: "Такси Утро" },
        { value: "taxi_night", label: "Такси Ночь" },
      ],
    },
  ];

  const formatPrice = (price: number) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "₽";

  const formatDate = (iso: string) => {
    try {
      const [y, m, d] = iso.split("-");
      return `${d}.${m}.${y}`;
    } catch {
      return iso;
    }
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;

    cart.forEach((item) => {
      const raw = item.price_per_day * item.quantity * item.shifts;
      const itemDiscount =
        item.discountType === "percent"
          ? (raw * item.discount) / 100
          : item.discount;
      subtotal += raw;
      totalDiscount += itemDiscount;
    });

    return {
      subtotal: Math.round(subtotal),
      total: Math.round(subtotal - totalDiscount),
    };
  }, [cart]);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("smeta-cart");
      if (storedCart) {
        const parsed: Partial<CartItem>[] = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          const items: CartItem[] = parsed.map((item) => ({
            id: item.id || `${Date.now()}`,
            equipment_name: item.equipment_name || "Неизвестно",
            category: item.category || "Без категории",
            rental_company: item.rental_company || "Без рентала",
            price_per_day: typeof item.price_per_day === "number" ? item.price_per_day : 0,
            quantity: item.quantity ?? 1,
            shifts: item.shifts ?? 1,
            discount: item.discount ?? 0,
            discountType: item.discountType === "fixed" ? "fixed" : "percent",
            discountSource: item.discountSource ?? 'individual',
          }));
          setCart(items);
        }
      }

      const storedGaffer = localStorage.getItem("smeta-gaffer");
      if (storedGaffer) setGafferName(storedGaffer);
      const storedProject = localStorage.getItem("smeta-project");
      if (storedProject) setProjectName(storedProject);
      const storedComment = localStorage.getItem("smeta-comment");
      if (storedComment) setComment(storedComment);
      const storedStart = localStorage.getItem("smeta-start-date");
      if (storedStart) setStartDate(storedStart);
      const storedEnd = localStorage.getItem("smeta-end-date");
      if (storedEnd) setEndDate(storedEnd);
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
      setError("Не удалось загрузить данные корзины. Попробуйте очистить хранилище.");
    }
  }, []);

  useEffect(() => {
    if (cart.length === 0) return;
    try {
      localStorage.setItem(
        "smeta-cart",
        JSON.stringify(
          cart.map((item) => ({
            ...item,
            quantity: item.quantity,
            shifts: item.shifts,
            discount: item.discount,
            discountType: item.discountType,
            discountSource: item.discountSource,
          }))
        )
      );
      localStorage.setItem("smeta-gaffer", gafferName);
      localStorage.setItem("smeta-project", projectName);
      localStorage.setItem("smeta-comment", comment);
      localStorage.setItem("smeta-start-date", startDate);
      localStorage.setItem("smeta-end-date", endDate);
    } catch (err) {
      console.error("Ошибка сохранения данных:", err);
      setError("Не удалось сохранить данные корзины.");
    }
  }, [cart, gafferName, projectName, comment, startDate, endDate]);

  const handleQuantityChange = (id: string, value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: numValue } : item)
    ));
  };

  const handleShiftsChange = (id: string, value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, shifts: numValue } : item)
    ));
  };

  const handleDiscountChange = (id: string, discount: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, discount, discountSource: 'individual' as const }
          : item
      )
    );
  };

  const handleDiscountTypeToggle = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              discountType: item.discountType === "percent" ? "fixed" : "percent",
              discountSource: 'individual' as const,
            }
          : item
      )
    );
  };

  const handleDuplicate = (id: string) => {
    const itemIndex = cart.findIndex((i) => i.id === id);
    if (itemIndex === -1) return;
    const originalItem = cart[itemIndex];
    if (!originalItem) return;
    const newItem = {
      ...originalItem,
      id: `${originalItem.id}-${Date.now()}`,
      discountSource: 'individual' as const,
    };
    setCart((prev) => [
      ...prev.slice(0, itemIndex + 1),
      newItem,
      ...prev.slice(itemIndex + 1),
    ]);
    toast.success("Позиция дублирована");
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success(`Позиция удалена`);
  };

  const handleDefaultShiftsChange = (shifts: number) => {
    if (shifts >= 1) {
      setDefaultShifts(shifts);
      setCart((prev) =>
        prev.map((item) => ({ ...item, shifts: item.shifts || shifts }))
      );
    }
  };

  const addStandardService = () => {
    if (!newServiceType || newServicePrice === null || newServicePrice <= 0) return;
    const serviceId = `service-${Date.now()}`;
    let serviceName = "";
    let serviceCategory = "";

    switch (newServiceType) {
      case "gaffer":
        serviceName = "Гаффер (10ч)";
        serviceCategory = "Персонал";
        break;
      case "overtime_gaffer":
        serviceName = "Переработка Гаффера (1ч)";
        serviceCategory = "Персонал";
        break;
      case "lighting":
        serviceName = "Осветитель (10ч)";
        serviceCategory = "Персонал";
        break;
      case "overtime_lighting":
        serviceName = "Переработка Осветителя (1ч)";
        serviceCategory = "Персонал";
        break;
      case "key_grip":
        serviceName = "Key Grip (10ч)";
        serviceCategory = "Персонал";
        break;
      case "overtime_key_grip":
        serviceName = "Переработка Key Grip (1ч)";
        serviceCategory = "Персонал";
        break;
      case "assistant":
        serviceName = "Ассистент (10ч)";
        serviceCategory = "Персонал";
        break;
      case "overtime_assistant":
        serviceName = "Переработка Ассистента (1ч)";
        serviceCategory = "Персонал";
        break;
      case "digi_assistant":
        serviceName = "Ассистент Digital (10ч)";
        serviceCategory = "Персонал";
        break;
      case "overtime_digi_assistant":
        serviceName = "Переработка Ассистента Digital (1ч)";
        serviceCategory = "Персонал";
        break;
      case "operator":
        serviceName = "Пультовик (10ч)";
        serviceCategory = "Персонал";
        break;
      case "overtime_operator":
        serviceName = "Переработка Пультовика (1ч)";
        serviceCategory = "Персонал";
        break;
      case "delivery":
        serviceName = "Доставка";
        serviceCategory = "Логистика";
        break;
      case "light_base":
        serviceName = "Светобаза";
        serviceCategory = "Логистика";
        break;
      case "taxi":
        serviceName = "Такси";
        serviceCategory = "Логистика";
        break;
      case "taxi_day":
        serviceName = "Такси Утро";
        serviceCategory = "Логистика";
        break;
      case "taxi_night":
        serviceName = "Такси Ночь";
        serviceCategory = "Логистика";
        break;
      default:
        return;
    }

    const newService: CartItem = {
      id: serviceId,
      equipment_name: serviceName,
      category: serviceCategory,
      rental_company: "—",
      price_per_day: newServicePrice,
      quantity: 1,
      shifts: 1,
      discount: 0,
      discountType: "percent",
      discountSource: 'individual',
    };

    setCart([...cart, newService]);
    toast.success("Услуга добавлена");
    setNewServiceType("");
    setNewServicePrice(null);
  };

  const addCustomService = () => {
    if (!customServiceName || customServiceCost === null || customServiceCost <= 0) return;
    const serviceId = `custom-service-${Date.now()}`;
    const newService: CartItem = {
      id: serviceId,
      equipment_name: customServiceName,
      category: "Другое",
      rental_company: "—",
      price_per_day: customServiceCost,
      quantity: 1,
      shifts: 1,
      discount: 0,
      discountType: "percent",
      discountSource: 'individual',
    };
    setCart([...cart, newService]);
    toast.success("Настраиваемая услуга добавлена");
    setCustomServiceName("");
    setCustomServiceCost(null);
  };

const handleExportPDF = () => {
  try {
    const doc = new jsPDF();
    registerRobotoFont(doc);
    doc.setLanguage("ru");
    doc.setFont("Roboto", "normal");
    let y = 20;
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
    const MARGIN_BOTTOM = 60; // Зарезервированное место для нижней части страницы

    // Проверка и добавление новой страницы
    const checkAndAddPage = (requiredHeight: number) => {
      if (y + requiredHeight > PAGE_HEIGHT - MARGIN_BOTTOM) {
        doc.addPage();
        y = 20;
      }
    };

    // Логотип и заголовок
    try {
      const logoWidth = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage("/setkit-logo.png", "PNG", logoX, y, logoWidth, logoWidth);
      y += logoWidth + 5;
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("CrewKit", pageWidth / 2, y, { align: "center" });
      y += 10;
    } catch {
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("CrewKit", 10, y);
      y += 10;
    }

    // Данные проекта
    doc.setFontSize(14);
    doc.text(`Проект: ${projectName.trim() || "Без названия"}`, 10, y);
    y += 8;
    doc.text(`Гаффер: ${gafferName.trim() || "Не указан"}`, 10, y);
    y += 8;
    if (startDate && endDate) {
      doc.text(`Дата: ${formatDate(startDate)} — ${formatDate(endDate)}`, 10, y);
      y += 10;
    }

    // Функция рендеринга таблицы
    const renderTable = (
      items: CartItem[],
      title: string,
      headColor: [number, number, number]
    ) => {
      if (items.length === 0) return;

      // Оценка высоты таблицы (примерно 10px на строку + заголовок)
      const estimatedHeight = items.length * 10 + 20;
      checkAndAddPage(estimatedHeight);

      doc.setFontSize(14);
      doc.text(title, 10, y);
      y += 8;

      const tableData = items.map((item) => {
        const raw = item.price_per_day * item.quantity * item.shifts;
        const discountAmt =
          item.discountType === "percent"
            ? (raw * item.discount) / 100
            : item.discount;
        return [
          item.equipment_name,
          formatPrice(item.price_per_day),
          item.quantity,
          item.shifts,
          item.discount > 0
            ? `${item.discount}${item.discountType === "percent" ? "%" : "₽"}`
            : "-",
          formatPrice(Math.round(raw - discountAmt)),
        ];
      });

      autoTable(doc, {
        head: [["Наименование", "Цена", "Кол-во", "Смены", "Скидка", "Итого"]],
        body: tableData,
        startY: y,
        theme: "grid",
        styles: {
          fontSize: 10,
          fontStyle: "normal",
          font: "Roboto",
        },
        headStyles: {
          fillColor: headColor,
          textColor: [255, 255, 255],
          fontStyle: "normal",
          font: "Roboto",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 },
        },
        margin: { left: 10, right: 10 },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    };

    // Группировка по ренталам, исключая категории "Персонал", "Логистика", "Другое"
    const groupedEquipment = cart.reduce((acc, item) => {
      const excludedCategories = ["Персонал", "Логистика", "Другое"];
      if (excludedCategories.includes(item.category)) return acc; // Пропускаем элементы этих категорий
      const rental = item.rental_company?.trim() || "Без рентала";
      if (!acc[rental]) acc[rental] = [];
      acc[rental].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);

    Object.entries(groupedEquipment).forEach(([rental, items]) => {
      renderTable(items, `Рентал: ${rental}`, [33, 150, 243]);
    });

    // Отображение категорий Персонал, Логистика, Другое
    const personnelItems = cart.filter((item) =>
      item.category.toLowerCase().includes("персонал")
    );
    const logisticsItems = cart.filter((item) =>
      item.category.toLowerCase().includes("логистик")
    );
    const otherItems = cart.filter((item) =>
      item.category.toLowerCase().includes("другое")
    );

    if (personnelItems.length > 0) {
      renderTable(personnelItems, "Персонал", [76, 175, 80]);
    }
    if (logisticsItems.length > 0) {
      renderTable(logisticsItems, "Логистика", [33, 150, 243]);
    }
    if (otherItems.length > 0) {
      renderTable(otherItems, "Прочее", [108, 99, 255]);
    }

    // Итоговая сумма
    const grandTotal = totals.total;
    checkAndAddPage(20); // Проверка места для итоговой суммы
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Общая сумма: ${formatPrice(grandTotal)}`, 190, y, {
      align: "right",
    });
    y += 10;

    // Количество оборудования
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    checkAndAddPage(20); // Проверка места для количества оборудования
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Всего оборудования: ${totalItems} шт.`, 10, y);
    y += 10;

    // Комментарий
    if (comment.trim()) {
      checkAndAddPage(20 + comment.trim().length / 2); // Примерная оценка высоты комментария
      doc.setFontSize(12);
      doc.text("Комментарий:", 10, y);
      y += 6;
      const lines = doc.splitTextToSize(comment.trim(), 180);
      doc.text(lines, 10, y);
      y += lines.length * 6 + 10;
    }

    doc.save(`smeta-${projectName.trim() || "estimate"}.pdf`);
    toast.success("PDF успешно скачан");
  } catch (err) {
    console.error("Ошибка генерации PDF:", err);
    setError("Не удалось создать PDF.");
    toast.error("Ошибка при скачивании PDF");
  }
};


  const handleClearCart = () => {
    try {
      localStorage.removeItem("smeta-cart");
      localStorage.removeItem("smeta-gaffer");
      localStorage.removeItem("smeta-project");
      localStorage.removeItem("smeta-comment");
      localStorage.removeItem("smeta-start-date");
      localStorage.removeItem("smeta-end-date");
      setCart([]);
      router.push("/");
      toast.success("Смета очищена");
    } catch (err) {
      console.error("Ошибка очистки корзины:", err);
      setError("Не удалось очистить смету.");
    }
  };

  const groupCartByCategory = (cart: CartItem[]) => {
    return cart.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  };

  const getCategoryColor = (category: string): [number, number, number] => {
    switch (category) {
      case "Персонал": return [76, 175, 80];
      case "Логистика": return [33, 150, 243];
      case "Другое": return [108, 99, 255];
      default: return [128, 128, 128];
    }
  };

  const handleGlobalDiscountChange = (value: number) => {
    if (value < 0 || (globalDiscountType === "percent" && value > 100)) return;

    setGlobalDiscount(value);

    const excludedCategories = ["Персонал", "Логистика", "Другое"];

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (excludedCategories.includes(item.category)) return item;
        if (value === 0) {
          return {
            ...item,
            discount: 0,
            discountType: "percent",
            discountSource: "individual" as const,
          };
        }
        return {
          ...item,
          discount: value,
          discountType: globalDiscountType,
          discountSource: "global" as const,
        };
      })
    );
  };

  const handleCategoryDiscountChange = (category: string, value: number) => {
    if (value < 0 || value > 100) return;

    setCategoryDiscounts((prev) => ({
      ...prev,
      [category]: value,
    }));

    const excludedCategories = ["Персонал", "Логистика", "Другое"];
    if (excludedCategories.includes(category)) return;

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.category !== category) return item;
        if (value === 0) {
          return {
            ...item,
            discount: 0,
            discountType: "percent",
            discountSource: "individual" as const,
          };
        }
        return {
          ...item,
          discount: value,
          discountType: "percent",
          discountSource: "category" as const,
        };
      })
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-100 min-h-screen">
      <ToastContainer />
      <div className="mb-8 text-center">
        <Link href="/">
          <img
            src="/setkit-logo.png"
            alt="CrewKit Logo"
            className="mx-auto mb-4 h-20 object-contain cursor-pointer transition-all hover:scale-105"
          />
        </Link>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">CrewKit: Смета</h1>
        <p className="text-gray-600">Управляйте вашей сметой и экспортируйте её в PDF</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">Информация о проекте</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя гафера</label>
            <input
              type="text"
              placeholder="Имя гафера"
              value={gafferName}
              onChange={(e) => setGafferName(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название проекта</label>
            <input
              type="text"
              placeholder="Название проекта"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Количество смен по умолчанию</label>
            <input
              type="number"
              min={1}
              value={defaultShifts}
              onChange={(e) => handleDefaultShiftsChange(Number(e.target.value))}
              className="border border-gray-300 px-4 py-2 rounded w-32 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Глобальная скидка</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                max={globalDiscountType === "percent" ? 100 : undefined}
                value={globalDiscount}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0 && (globalDiscountType !== "percent" || value <= 100))
                    handleGlobalDiscountChange(value);
                }}
                className="border border-gray-300 px-4 py-2 rounded w-24 focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() =>
                  setGlobalDiscountType(globalDiscountType === "percent" ? "fixed" : "percent")
                }
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all"
              >
                {globalDiscountType === "percent" ? "%" : "₽"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
          <textarea
            placeholder="Комментарий для клиента (альтернативы, нюансы, замены...)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded w-full min-h-[120px] focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Скидки по категориям</h2>
        {Object.keys(groupCartByCategory(cart))
          .filter(category => !["Персонал", "Логистика", "Другое"].includes(category))
          .map((category) => (
            <div key={category} className="flex items-center gap-2 mb-2">
              <span>{category}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={categoryDiscounts[category] || 0}
                onChange={(e) => {
                  const newDiscount = Number(e.target.value);
                  handleCategoryDiscountChange(category, newDiscount);
                }}
                className="border border-gray-300 px-2 py-1 rounded w-20"
              />
              <span>%</span>
            </div>
          ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
  <h2 className="text-2xl font-semibold text-gray-700 mb-4">
    Добавить Логистику / Персонал
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <select
      value={newServiceType}
      onChange={(e) => setNewServiceType(e.target.value)}
      className="border border-gray-300 px-4 py-2 rounded w-full"
    >
      <option value="">Выберите услугу</option>
      {serviceOptions.map((group) => (
        <optgroup key={group.group} label={group.group}>
          {group.items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
    <input
      type="number"
      placeholder="Цена за единицу"
      value={newServicePrice === null ? "" : newServicePrice}
      onChange={(e) => setNewServicePrice(Number(e.target.value))}
      className="border border-gray-300 px-4 py-2 rounded w-full"
    />
  </div>
  <button
    onClick={addStandardService}
    disabled={!newServiceType || newServicePrice === null || newServicePrice <= 0}
    className={`mt-4 px-6 py-3 rounded-lg text-white transition-all ${
      !newServiceType || newServicePrice === null || newServicePrice <= 0
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700"
    }`}
  >
    Добавить услугу
  </button>
</div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Добавить любую услугу</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Название услуги"
            value={customServiceName}
            onChange={(e) => setCustomServiceName(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Стоимость"
            value={customServiceCost === null ? "" : customServiceCost}
            onChange={(e) => setCustomServiceCost(Number(e.target.value))}
            className="border border-gray-300 px-4 py-2 rounded"
          />
        </div>
        <button
          onClick={addCustomService}
          disabled={!customServiceName || customServiceCost === null || customServiceCost <= 0}
          className={`mt-4 px-6 py-3 rounded-lg text-white transition-all ${
            !customServiceName || customServiceCost === null || customServiceCost <= 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Добавить услугу
        </button>
      </div>

      {cart.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">Корзина</h2>
          <div className="overflow-x-auto">
            {Object.entries(groupCartByCategory(cart)).map(([category, items]) => (
              <div key={category} className="mb-6">
                <h3 className="text-xl font-bold mb-4">{category}</h3>
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm font-medium text-gray-700">
                      <th className="py-3 px-4 w-48">Наименование</th>
                      <th className="py-3 px-4 w-32">Рентал</th>
                      <th className="py-3 px-4 w-24">Цена</th>
                      <th className="py-3 px-4 w-24">Кол-во</th>
                      <th className="py-3 px-4 w-24">Смены</th>
                      <th className="py-3 px-4 w-32">Скидка</th>
                      <th className="py-3 px-4 w-32 text-right">Итого</th>
                      <th className="py-3 px-4 w-32">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onShiftsChange={handleShiftsChange}
                        onDiscountChange={handleDiscountChange}
                        onDiscountTypeToggle={handleDiscountTypeToggle}
                        onDuplicate={handleDuplicate}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500 text-lg">В смете пока ничего нет.</p>
        </div>
      )}

      {cart.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">Итоговая сумма</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-base">
              <span>Сумма без скидок:</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-base text-green-600">
              <span>Скидки:</span>
              <span>-{formatPrice(totals.subtotal - totals.total)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800">
              <span>Итого:</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="mt-6 flex gap-4 flex-wrap justify-center">
          <button
            onClick={handleExportPDF}
            className="px-6 py-3 rounded-lg flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md"
          >
            <ArrowDownTrayIcon className="h-5 w-5" /> Скачать PDF
          </button>
          <button
            onClick={handleClearCart}
            className="px-6 py-3 rounded-lg flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 transition-all"
          >
            <TrashIcon className="h-5 w-5" /> Очистить
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-lg flex items-center gap-2 bg-gray-600 text-white hover:bg-gray-700 transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5" /> Назад
          </Link>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg shadow-md">
          {error}
        </div>
      )}
    </div>
  );
}