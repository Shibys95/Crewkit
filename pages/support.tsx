// pages/support.tsx
import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function SupportPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6">Поддержать проект</h1>

      <section className="space-y-4 text-gray-800 text-base leading-relaxed">
        <p>
  <strong>CrewKit</strong> — это независимый проект, сделанный вручную и на энтузиазме.
  Он остаётся бесплатным и создаётся с прицелом на удобство для всех, кто работает со светом и ренталами.
</p>


        <p>
          Если тебе полезен CrewKit и хочется поддержать развитие проекта —
          это можно сделать прямо сейчас. Это поможет оплачивать хостинг, развивать функционал и делать всё ещё лучше.
        </p>

        <div className="border-t pt-4 mt-6 text-sm text-gray-700 space-y-4">
          <p className="font-semibold">💸 Реквизиты для поддержки:</p>

          <div className="flex items-center gap-3">
            <span className="font-mono">5536 9138 3069 4119</span>
            <button
              onClick={() => handleCopy("5536913830694119")}
              className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
            >
              {copiedText === "5536913830694119" ? "Скопировано!" : "Скопировать"}
            </button>
            <span className="text-gray-500">Тинькофф</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono">2202 2019 8344 6838</span>
            <button
              onClick={() => handleCopy("2202201983446838")}
              className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
            >
              {copiedText === "2202201983446838" ? "Скопировано!" : "Скопировать"}
            </button>
            <span className="text-gray-500">Сбер</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Даже 100 рублей — это сигнал, что проект нужен.  
          Спасибо за доверие и за то, что пользуешься CrewKit ❤️
        </p>
      </section>
    </main>
  );
}
