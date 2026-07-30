import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  // 1. Rotas públicas — Isenta de checagem remota de Auth no middleware para resposta ultra-rápida (sem network delay)
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/hub') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/formulario') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/videos') ||
    pathname === '/favicon.ico'

  if (isPublic) {
    // Se o usuário tentar acessar a tela de login estando autenticado, redireciona ao Hub
    if (pathname === '/login') {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              supabaseResponse = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options),
              )
            },
          },
        },
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const next = request.nextUrl.searchParams.get('next')
        const url = request.nextUrl.clone()
        url.search = ''
        url.pathname = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  }

  // 2. Rotas protegidas (CRM / Dashboard comercial)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const next = request.nextUrl.pathname + request.nextUrl.search
    const url = request.nextUrl.clone()
    url.pathname = pathname.startsWith('/marketing') ? '/hub/marketing/login' : '/login'
    url.search = ''
    url.searchParams.set('next', next)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
