import { updateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { TAG_PONTOS } from "@/lib/dados/pontos";
import { TAG_SERVICOS } from "@/lib/dados/servicos";

/**
 * API endpoint para invalidar o cache de conteúdo público.
 * Usada pelo script de batch import para refletir mudanças no Firestore.
 *
 * POST /api/revalidar
 * Body: { "tag": "pontos" | "servicos" | "ambos" }
 */
export async function POST(request: NextRequest) {
  const { tag } = (await request.json()) as { tag?: string };

  const tags = {
    pontos: TAG_PONTOS,
    servicos: TAG_SERVICOS,
  };

  if (tag === "pontos" || tag === "ambos") {
    updateTag(TAG_PONTOS);
  }
  if (tag === "servicos" || tag === "ambos") {
    updateTag(TAG_SERVICOS);
  }

  return Response.json(
    { ok: true, message: `Cache invalidado: ${tag || "ambos"}` },
    { status: 200 },
  );
}
