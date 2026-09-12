import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

// --- Configuração do provedor de IA de foto realista --------------------
// Usa fal.ai (https://fal.ai) porque uma única chave (FAL_KEY) dá acesso
// tanto à geração da imagem de referência da peça quanto ao modelo de
// "virtual try-on" que aplica a peça sobre a foto da pessoa.
//
// Para trocar de provedor no futuro, basta reescrever as duas chamadas
// abaixo (geração da peça e try-on) mantendo o mesmo formato de entrada/
// saída desta rota: POST { fotoPessoa, descricaoRoupa } -> { imageUrl }.
const FAL_KEY = process.env.FAL_KEY;

const TEXT_TO_IMAGE_MODEL = "fal-ai/flux/schnell";
const TRY_ON_MODEL = "fal-ai/image-apps-v2/virtual-try-on";

if (FAL_KEY) {
  fal.config({ credentials: FAL_KEY });
}

export const runtime = "nodejs";

// GET — permite que a tela "Experimentar em mim" saiba, sem expor a chave,
// se a geração de foto realista está disponível nesta implantação.
export async function GET() {
  return NextResponse.json({ available: Boolean(FAL_KEY) });
}

function dataUrlParaBlob(dataUrl: string): Blob {
  const [cabecalho, base64] = dataUrl.split(",");
  const mime = cabecalho.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
  const buffer = Buffer.from(base64, "base64");
  return new Blob([buffer], { type: mime });
}

interface FalImageResult {
  data?: {
    images?: { url: string }[];
    image?: { url: string };
  };
}

export async function POST(req: NextRequest) {
  if (!FAL_KEY) {
    return NextResponse.json(
      {
        error:
          "Geração de foto realista ainda não configurada. Defina a variável de ambiente FAL_KEY.",
      },
      { status: 501 },
    );
  }

  try {
    const { fotoPessoa, descricaoRoupa } = (await req.json()) as {
      fotoPessoa?: string;
      descricaoRoupa?: string;
    };

    if (!fotoPessoa || !descricaoRoupa) {
      return NextResponse.json(
        { error: "Envie a foto da pessoa e a descrição da roupa." },
        { status: 400 },
      );
    }

    // 1) sobe a foto da pessoa para o storage da fal (os modelos exigem URL)
    const personBlob = dataUrlParaBlob(fotoPessoa);
    const personUrl = await fal.storage.upload(personBlob);

    // 2) gera uma imagem de referência da peça a partir da descrição do look
    const garmentResult = (await fal.subscribe(TEXT_TO_IMAGE_MODEL, {
      input: {
        prompt: `product photo of clothing, flat lay, front-facing, studio lighting, plain neutral background, no person: ${descricaoRoupa}`,
        image_size: "square_hd",
      },
    })) as FalImageResult;
    const garmentUrl = garmentResult.data?.images?.[0]?.url;
    if (!garmentUrl) {
      throw new Error("Não foi possível gerar a imagem de referência da peça.");
    }

    // 3) aplica a peça gerada sobre a foto da pessoa
    const tryOnResult = (await fal.subscribe(TRY_ON_MODEL, {
      input: {
        person_image_url: personUrl,
        clothing_image_url: garmentUrl,
      },
    })) as FalImageResult;
    const imageUrl = tryOnResult.data?.image?.url ?? tryOnResult.data?.images?.[0]?.url;
    if (!imageUrl) {
      throw new Error("A IA não retornou uma imagem.");
    }

    return NextResponse.json({ imageUrl, garmentUrl });
  } catch (err) {
    console.error("Erro na geração de foto realista:", err);
    return NextResponse.json(
      { error: "Não foi possível gerar a simulação agora. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
