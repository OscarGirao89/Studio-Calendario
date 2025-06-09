
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { useToast } from "@/hooks/use-toast";
import { TEACHERS } from '@/lib/constants';

const USER_CREDENTIALS_KEY = 'userAppCredentials';

// Default credentials if not found in localStorage
const defaultUserCredentials: Record<string, string> = {
  oski: 'oski123',
  flor: 'flor123',
  joa: 'joa123',
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userCredentials, setUserCredentials] = useState<Record<string, string>>({});
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCredentials = localStorage.getItem(USER_CREDENTIALS_KEY);
      if (storedCredentials) {
        setUserCredentials(JSON.parse(storedCredentials));
      } else {
        localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(defaultUserCredentials));
        setUserCredentials(defaultUserCredentials);
      }
    }
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const lowerCaseUsername = username.toLowerCase();

    setTimeout(() => {
      if (TEACHERS.map(t => t.toLowerCase()).includes(lowerCaseUsername) && userCredentials[lowerCaseUsername] === password) {
        localStorage.setItem('loggedInUser', username); // Store original casing
        toast({ title: 'Inicio de Sesión Exitoso', description: `Bienvenido/a, ${username}!` });
        router.push('/');
      } else if (!TEACHERS.map(t => t.toLowerCase()).includes(lowerCaseUsername)) {
        toast({ variant: 'destructive', title: 'Error de Inicio de Sesión', description: 'Nombre de usuario no válido.' });
        setIsLoading(false);
      } else {
        toast({ variant: 'destructive', title: 'Error de Inicio de Sesión', description: 'Contraseña incorrecta.' });
        setIsLoading(false);
      }
    }, 500);
  };

  const handleGuestLogin = () => {
    localStorage.setItem('loggedInUser', 'GuestUser');
    toast({ title: 'Modo Invitado Activado', description: 'Estás viendo el calendario como invitado.' });
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <LogoIcon className="h-12 w-auto mb-4" />
          <CardTitle className="text-3xl font-headline">SucioStudio</CardTitle>
          <CardDescription>Accede al panel o explora como invitado.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base">Nombre de Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Escribe Oski, Flor o Joa"
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full text-base py-3" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button variant="link" onClick={handleGuestLogin} className="text-accent hover:text-accent/80">
              Entrar como Invitado
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          <p>Este es un sistema de prototipo. Las contraseñas son simuladas y se guardan localmente.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
