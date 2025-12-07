import OpenAI from 'openai';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface SessionData {
  user?: {
    id_token: string;
    access_token: string;
    token_type: string;
    expires_in: number;
  };
  userInfo?: {
    id: string;
    numeroDocumento?: string;
    email?: string;
    name?: string;
    givenName?: string;
    familyName?: string;
    preferredUsername?: string;
  };
  isLoggedIn?: boolean;
}

// POST /api/user/autodiagnostico
export async function POST(request: NextRequest) {
  // const session = await getIronSession<SessionData>(await cookies(), {
  //   password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
  //   cookieName: 'auth-session',
  // });

  // if (!session.isLoggedIn || !session.user?.access_token) {
  //   return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  // }

  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      console.error('NEXT_PUBLIC_OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'No está configurada la API Key para autodiagnóstico' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const sintomas = Array.isArray(body?.sintomas) ? body.sintomas : [];
    if (sintomas.length === 0) {
      return NextResponse.json({ error: 'Debe enviar al menos un síntoma' }, { status: 400 });
    }


    const openai = new OpenAI({ apiKey });
    const model = 'gpt-5-nano';
    const completion = await openai.chat.completions.create({
      model,
      reasoning_effort: "low",
      max_tokens: 180,
      messages: [
        {
          role: 'system',
          content:
            'Eres un médico que entrega un diagnóstico breve y probable en español. Devuelve solo el diagnóstico sin saludos ni despedidas.',
        },
        {
          role: 'user',
          content: `Síntomas reportados: ${sintomas.join(', ')}`,
        },
      ],
    });

    const diagnostico =
      completion.choices[0]?.message?.content?.trim() ||
      'No se pudo generar un diagnóstico en este momento.';

    return NextResponse.json({ diagnostico });
  } catch (error) {
    console.error('Error generando autodiagnostico:', error);
    return NextResponse.json(
      { error: 'Error generando autodiagnóstico' },
      { status: 500 }
    );
  }
}
