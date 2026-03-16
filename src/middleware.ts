import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Роуты, требующие авторизации
const protectedRoutes = [
  '/finance',
  '/nutrition',
  '/workouts',
  '/habits',
  '/goals',
  '/health',
  '/mind',
  '/beauty',
  '/automations',
  '/settings',
  '/widgets',
  '/sharing',
];

// Supabase project ref для имени cookie
const SUPABASE_PROJECT_REF = 'lyxtpcyjgnrynpyvemyb';

// Все возможные имена cookie Supabase
function getSupabaseSessionCookie(request: NextRequest) {
  // Проверяем все возможные форматы имён cookie
  const possibleNames = [
    `sb-${SUPABASE_PROJECT_REF}-auth-token`,
    `sb-${SUPABASE_PROJECT_REF}-session`,
    'supabase-auth-token',
    'sb-auth-token',
    'sb-session',
  ];

  for (const name of possibleNames) {
    const cookie = request.cookies.get(name);
    if (cookie && cookie.value && cookie.value.length > 10) {
      // Cookie найдена и имеет значение
      return cookie;
    }
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Главная страница и login - публичные
  if (pathname === '/' || pathname === '/login') {
    const sessionCookie = getSupabaseSessionCookie(request);
    const localUserCookie = request.cookies.get('lifeos_local_user');

    // Если есть сессия и пользователь на login - редирект на главную
    if (pathname === '/login' && (sessionCookie || localUserCookie)) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  // Проверяем сессию
  const sessionCookie = getSupabaseSessionCookie(request);

  // Проверяем локальный режим
  const localUserCookie = request.cookies.get('lifeos_local_user');

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Если нет сессии и нет локального пользователя и роут защищенный - редирект на логин
  if (isProtectedRoute && !sessionCookie && !localUserCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
