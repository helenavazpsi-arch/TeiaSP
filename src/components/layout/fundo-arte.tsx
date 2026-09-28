/**
 * A arte de fundo (aquarela creditada a Mun_do Purpura no cabeçalho).
 *
 * Fica num <picture> fixo atrás do conteúdo em vez de background-image do CSS:
 * assim o navegador escolhe AVIF ou WebP conforme o suporte, e a arte vertical
 * de celular entra por art direction — coisas que background-image não faz.
 * No site antigo essas duas imagens somavam 380 KB de base64 dentro do HTML.
 */
export function FundoArte() {
  return (
    <picture className="pointer-events-none fixed inset-0 -z-10 block">
      <source media="(max-width: 600px)" type="image/avif" srcSet="/img/bg-mobile-412.avif" />
      <source media="(max-width: 600px)" type="image/webp" srcSet="/img/bg-mobile-412.webp" />
      <source
        type="image/avif"
        srcSet="/img/bg-desktop-1000.avif 1000w, /img/bg-desktop-1400.avif 1400w"
      />
      <source
        type="image/webp"
        srcSet="/img/bg-desktop-1000.webp 1000w, /img/bg-desktop-1400.webp 1400w"
      />
      <img
        src="/img/bg-desktop.jpg"
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover"
      />
    </picture>
  );
}
