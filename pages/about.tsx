// pages/about.tsx
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6">О проекте</h1>

      <section className="space-y-4 text-gray-800 text-base leading-relaxed">
        <p>
          <strong>CrewKit</strong> — это калькулятор смет и агрегатор ренталов для съёмочной индустрии Москвы.
          Он позволяет быстро находить нужное оборудование в разных ренталах, сравнивать цены и собирать сметы —
          без регистрации, бесплатно и в пару кликов.
        </p>

        <p>
          Проект создан, чтобы сэкономить тебе нервы. Больше не нужно лезть на 5–10 сайтов, вручную копировать
          цены и мучиться с таблицами. CrewKit автоматизирует этот процесс — выбираешь оборудование, фильтруешь по ренталам и
          сразу получаешь аккуратную смету, которую можно скачать в PDF.
        </p>

        <p>
          Основная аудитория: гафферы, операторы, фотографы, продакшены, координаторы и все, кто когда-либо
          собирал смету на съёмку.
        </p>

        <p>
          Помимо оборудования, в CrewKit можно добавлять в смету любые услуги: персонал, логистику, трансфер, питание — всё, что относится к съёмочному процессу. Это делает платформу удобной не только для технических специалистов, но и для продюсеров, координаторов и всех, кто работает над проектом комплексно.
        </p>

        <p>
          <strong>CrewKit развивается</strong> — проект остаётся живым и будет постепенно дополняться и улучшаться.
          Основная цель — сделать процесс работы с ренталами проще, быстрее и удобнее.
        </p>

        <p>
          Проект сделан вручную с нуля. Идея, дизайн, код — всё собрал один человек.  
          Любая обратная связь, предложения или просто добрые слова — приветствуются 🙌
        </p>

        <div className="border-t pt-4 mt-6 text-sm text-gray-600 space-y-1">
          <p>📬 По всем вопросам: <a href="mailto:Shibaevpa@yandex.ru" className="text-blue-600 underline">Shibaevpa@yandex.ru</a></p>
          <p>📢 Telegram-канал: <a href="https://t.me/kit4crew" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">@kit4crew</a></p>
          <p>👤 Telegram (лично): <a href="https://t.me/Shibys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">@Shibys</a></p>
          <p>🌐 Сайт: <a href="https://crewkit.ru" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">crewkit.ru</a></p>
        </div>
      </section>
    </main>
  );
}
