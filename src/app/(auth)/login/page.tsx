'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithMagicLink,
  signInLocally,
  isLocalMode
} from '@/core/auth';
import { toast } from 'sonner';
import { Mail, Loader2, Laptop, Key, LogIn, UserPlus, Sparkles, Eye, EyeOff } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'magic' | 'local';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверка совпадения паролей при регистрации
    if (mode === 'signup' && password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      let result;

      if (mode === 'signin') {
        // Вход по email+пароль
        result = await signInWithEmail(email, password);
        if (result.error) {
          toast.error(result.error.message);
        } else {
          toast.success('С возвращением!');
          setTimeout(() => router.push('/'), 1000);
        }
      } else if (mode === 'signup') {
        // Регистрация по email+пароль
        result = await signUpWithEmail(email, password);
        if (result.error) {
          toast.error(result.error.message);
        } else if (result.requiresEmailConfirmation) {
          toast.success('Проверьте почту для подтверждения!');
        } else {
          toast.success('Аккаунт создан! Вход...');
          setTimeout(() => router.push('/'), 1000);
        }
      } else if (mode === 'magic') {
        // Magic link
        result = await signInWithMagicLink(email);
        if (result.error) {
          toast.error(result.error.message);
        } else {
          toast.success('Проверьте почту! Мы отправили ссылку для входа.');
        }
      } else if (mode === 'local') {
        // Локальный режим
        const localUser = signInLocally(email || 'demo@lifeos.local');
        toast.success(`Вы вошли в локальном режиме как ${localUser.email}`);
        router.push('/');
      }
    } catch {
      toast.error('Произошла ошибка. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordRequirements = () => {
    if (password.length === 0) return [];

    const requirements = [
      { met: password.length >= 8, text: 'Минимум 8 символов' },
      { met: /[A-Z]/.test(password), text: 'Заглавная буква' },
      { met: /[a-z]/.test(password), text: 'Строчная буква' },
      { met: /[0-9]/.test(password), text: 'Цифра' },
    ];

    return requirements;
  };

  const passwordRequirements = mode === 'signup' ? getPasswordRequirements() : [];
  const isPasswordValid = passwordRequirements.every(r => r.met);
  const doPasswordsMatch = mode === 'signup' && password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-soft/20 to-secondary-soft/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">LifeOS</CardTitle>
          <CardDescription>
            {mode === 'signin' && 'Вход в аккаунт'}
            {mode === 'signup' && 'Создание аккаунта'}
            {mode === 'magic' && 'Вход без пароля'}
            {mode === 'local' && 'Локальный режим — данные только в этом браузере'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Переключатель режимов */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Button
              type="button"
              variant={mode === 'signin' || mode === 'signup' ? 'default' : 'outline'}
              className="gap-2"
              onClick={() => setMode('signin')}
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Вход</span>
            </Button>
            <Button
              type="button"
              variant={mode === 'magic' ? 'default' : 'outline'}
              className="gap-2"
              onClick={() => setMode('magic')}
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Magic Link</span>
            </Button>
            <Button
              type="button"
              variant={mode === 'signup' ? 'default' : 'outline'}
              className="gap-2"
              onClick={() => setMode('signup')}
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Регистрация</span>
            </Button>
            <Button
              type="button"
              variant={mode === 'local' ? 'default' : 'outline'}
              className="gap-2"
              onClick={() => setMode('local')}
            >
              <Laptop className="h-4 w-4" />
              <span className="hidden sm:inline">Локально</span>
            </Button>
          </div>

          {(mode === 'signin' || mode === 'signup' || mode === 'magic') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {(mode === 'signin' || mode === 'signup') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Пароль
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        minLength={mode === 'signup' ? 8 : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {mode === 'signup' && passwordRequirements.length > 0 && (
                      <div className="text-xs space-y-1 mt-2">
                        <p className="font-medium">Требования к паролю:</p>
                        {passwordRequirements.map((req, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${req.met ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-sm font-medium">
                        Подтверждение пароля
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {confirmPassword.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <div className={`w-3 h-3 rounded-full ${doPasswordsMatch ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={doPasswordsMatch ? 'text-green-600' : 'text-red-600'}>
                            {doPasswordsMatch ? 'Пароли совпадают' : 'Пароли не совпадают'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {mode === 'magic' && (
                <p className="text-xs text-muted-foreground">
                  Мы отправим вам ссылку для входа на email.
                  <br />
                  Не требуется пароль.
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || (mode === 'signup' && (!isPasswordValid || !doPasswordsMatch))}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'signin' && 'Вход...'}
                    {mode === 'signup' && 'Регистрация...'}
                    {mode === 'magic' && 'Отправка...'}
                  </>
                ) : (
                  <>
                    {mode === 'signin' && (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Войти
                      </>
                    )}
                    {mode === 'signup' && (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Зарегистрироваться
                      </>
                    )}
                    {mode === 'magic' && (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Отправить ссылку
                      </>
                    )}
                  </>
                )}
              </Button>
            </form>
          )}

          {mode === 'local' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="local-email" className="text-sm font-medium">
                  Имя пользователя (необязательно)
                </label>
                <div className="relative">
                  <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="local-email"
                    type="text"
                    placeholder="demo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Данные хранятся только в этом браузере.
                  <br />
                  При очистке кэша данные будут потеряны.
                </p>
              </div>
              <Button type="submit" className="w-full">
                <Laptop className="mr-2 h-4 w-4" />
                Войти локально
              </Button>
            </form>
          )}

          {isLocalMode() && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-600 dark:text-amber-400">
              <strong>Локальный режим:</strong> Вы работаете без регистрации.
              Данные синхронизируются только в этом браузере.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Отключаем статическую генерацию
export const dynamic = 'force-dynamic';
