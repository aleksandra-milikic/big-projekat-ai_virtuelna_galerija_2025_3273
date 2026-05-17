"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setLoggedIn(true);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-5xl md:text-6xl font-bold text-indigo-600 leading-tight">
          Inteligentna Virtuelna Galerija
        </h1>

        <p className="mt-6 max-w-2xl text-gray-600 text-lg">
          Moderna web aplikacija za pregled, pretragu i upravljanje umjetničkim
          djelima kroz interaktivni digitalni prostor.
        </p>

        
        <div className="mt-8">
          <button
            onClick={() =>
              router.push(loggedIn ? "/gallery" : "/login")
            }
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors duration-200"
          >
            {loggedIn ? "Go to Gallery" : "Start Exploring"}
          </button>
        </div>
      </section>

      
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <h2 className="text-xl font-semibold text-indigo-600">
              Digitalna galerija
            </h2>
            <p className="mt-3 text-gray-600">
              Pregled umjetničkih djela kroz moderan i responzivan interfejs.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <h2 className="text-xl font-semibold text-indigo-600">
              Pretraga umjetničkih djela
            </h2>
            <p className="mt-3 text-gray-600">
              Brzo pronalaženje radova po nazivu, opisu i osnovnim informacijama.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
             <h2 className="text-xl font-semibold text-indigo-600">
               Personalizovane preporuke
             </h2>
             <p className="mt-3 text-gray-600">
               Sistem preporučuje slična umjetnička djela na osnovu stilova, tema, atmosfere i karakteristika radova koje korisnik označi kao omiljene.
             </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
            <h2 className="text-xl font-semibold text-indigo-600">
              Upravljanje sadržajem
            </h2>
            <p className="mt-3 text-gray-600">
              Administratorski i kustoski sistem za dodavanje i upravljanje
              kolekcijama.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}