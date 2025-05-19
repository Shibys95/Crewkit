// pages/rentals.tsx
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface RentalCompany {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

const rentals: RentalCompany[] = [
  {
    name: "A1 rental",
    description:
      "Компания с 2009 года предоставляет в аренду передовое осветительное оборудование для фото- и видеопроизводства на базе студийных комплексов A1. С 2023 года работает подразделение A1 rental, специализирующееся на прокате эксклюзивного и современного оборудования для профессиональной съёмки.",
    address: "Москва, Самокатная улица, 2Ас1",
    phone: "+7 (495) 971-68-58, +7 (977) 898-68-58, +7 (977) 158-68-58",
    email: "a1@a1-studios.com",
    website: "https://a1-studios.com",
  },
  {
    name: "Богдан и Бригада",
    description:
      "Компания с 2000 года предоставляет в аренду современное осветительное оборудование, операторские тележки, краны и генераторы для кино- и телепроизводства, рекламных роликов, музыкальных клипов и фотосъёмок.",
    address: "Москва, Волгоградский пр-т, д. 21, стр. 9,10",
    phone: "+7 (495) 643-19-89, +7 (916) 631-78-79",
    email: "rental@bogdanibrigada.ru",
    website: "https://www.bogdanibrigada.ru/",
  },
  {
    name: "LightProduction",
    description:
      "Агентство с собственным продакшеном, предоставляющее услуги аренды осветительного оборудования и технического обеспечения мероприятий.",
    address: "Москва, Автомобильный проезд, д. 10, стр. 23",
    phone: "+7 (910) 499-09-09",
    email: "post@lightproduction.ru",
    website: "https://lightproduction.tv/",
  },
  {
    name: "ProSvet",
    description:
      "Студия и рентал, предлагающие профессиональное освещение и пространство для фотосессий и видеосъёмок.",
    address: "Москва, ул. Правды, д. 24, стр. 3",
    phone: "+7 (985) 033-51-86",
    email: "prosvet@prosvet.space",
    website: "https://pravdaprosvet.ru/",
  },
  {
    name: "Vader Group",
    description:
      "Компания, предоставляющая осветительное оборудование лучших брендов для аренды и проката в кино- и телесъёмках, концертах, шоу, презентациях и выставках.",
    address:
      "Офис: Москва, ул. Новослободская, д. 61, стр. 2\nСклад: Москва, Автозаводская ул., д. 16, к. 2, стр. 13",
    phone: "+7 (903) 130-71-36",
    email: "info@vadergroup.ru",
    website: "https://vadergroup.ru/",
  },
];

export default function RentalsPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6">Ренталы</h1>
      <ul className="space-y-6">
        {rentals.map((rental, idx) => (
          <li key={idx} className="border p-6 rounded-xl shadow-sm bg-white">
            <h2 className="text-2xl font-semibold mb-2">{rental.name}</h2>
            <p className="text-gray-700 mb-2">{rental.description}</p>
            <div className="text-sm text-gray-600 space-y-1 whitespace-pre-line">
              <div>📍 {rental.address}</div>
              <div>📞 {rental.phone}</div>
              <div>📧 {rental.email}</div>
              <div>
                🌐{" "}
                <a
                  href={rental.website}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {rental.website}
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
