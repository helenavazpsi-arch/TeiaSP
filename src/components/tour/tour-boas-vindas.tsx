"use client";

import { useEffect } from "react";

const CHAVE = "teiasp_tour_visto";

/**
 * Tour de boas-vindas, com os mesmos passos do site atual.
 *
 * Lá eram ~90 linhas de posicionamento manual (calcular retângulo do alvo,
 * recortar o overlay, reposicionar o cartão na virada de aba). O driver.js faz
 * isso e ainda prende o foco do teclado dentro do cartão.
 *
 * Roda sozinho na primeira visita; depois só pelo menu, que dispara o evento
 * `teiasp:tour`.
 */
export function TourBoasVindas() {
  useEffect(() => {
    let encerrar: (() => void) | undefined;

    async function iniciar() {
      const { driver } = await import("driver.js");
      await import("driver.js/dist/driver.css");

      const tour = driver({
        showProgress: true,
        nextBtnText: "Próximo",
        prevBtnText: "Anterior",
        doneBtnText: "Entendi",
        progressText: "{{current}} de {{total}}",
        steps: [
          {
            popover: {
              title: "Bem-vinde à Teia SP!",
              description:
                "Somos um guia colaborativo que reúne dispositivos, equipamentos e iniciativas da cidade de São Paulo. Vamos te mostrar rapidinho onde encontrar cada coisa — leva menos de 1 minuto.",
            },
          },
          {
            element: "#busca",
            popover: {
              title: "Busque e filtre",
              description:
                "Digite uma palavra-chave, sigla ou nome do dispositivo. Também dá para filtrar por área e por público atendido.",
            },
          },
          {
            element: '[aria-label="Filtrar por área"]',
            popover: {
              title: "Filtre por área",
              description:
                "Saúde, assistência social, educação, moradia... toque em uma área para ver só os dispositivos dela.",
            },
          },
          {
            element: 'a[href="/mapa"]',
            popover: {
              title: "Aba Mapa",
              description:
                "Veja a localização de cada unidade no mapa de São Paulo, com busca por bairro e por zona.",
            },
          },
          {
            element: 'a[href="/sugerir"]',
            popover: {
              title: "Sugerir um dispositivo",
              description:
                "Não achou o que procurava? Sugira um novo dispositivo — sua contribuição é revisada pela equipe antes de ser publicada.",
            },
          },
        ],
        onDestroyed: () => {
          try {
            localStorage.setItem(CHAVE, "1");
          } catch {
            // navegação privada ou storage bloqueado: só não lembra da visita
          }
        },
      });

      tour.drive();
      encerrar = () => tour.destroy();
    }

    function aoPedirTour() {
      void iniciar();
    }

    window.addEventListener("teiasp:tour", aoPedirTour);

    let jaViu = true;
    try {
      jaViu = localStorage.getItem(CHAVE) === "1";
    } catch {
      // sem storage, não insiste com quem já pode ter visto
    }

    const agendado = jaViu ? undefined : setTimeout(() => void iniciar(), 700);

    return () => {
      window.removeEventListener("teiasp:tour", aoPedirTour);
      if (agendado) clearTimeout(agendado);
      encerrar?.();
    };
  }, []);

  return null;
}
