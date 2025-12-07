import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

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
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not configured');
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
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: 'system',
          content:
            'Eres un médico que entrega un diagnóstico breve y probable en español. Devuelve solo el diagnóstico sin saludos ni despedidas, proporciona por lo menos un posible motivo/diagnóstico.',
        },
        {
          role: 'user',
          content: `Síntomas reportados: ${sintomas.join(', ')}`,
        },
      ],
      reasoning_effort: "low",
    });

    const diagnostico =
      completion.choices[0]?.message?.content?.trim() ||
      'No se pudo generar un diagnóstico en este momento.';

    return NextResponse.json({ diagnostico });
  } catch (error) {
    console.error('Error generando autodiagnostico:', error);

    let errorMessage = 'Error generando autodiagnóstico';
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error === 'object' && error && 'message' in error) {
      errorMessage = String((error as any).message) || errorMessage;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
