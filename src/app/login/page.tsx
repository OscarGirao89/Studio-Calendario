
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { useToast } from "@/hooks/use-toast";
import { TEACHERS } from '@/lib/constants'; // Reuse the teacher list for valid users

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (TEACHERS.map(t => t.toLowerCase()).includes(username.toLowerCase())) {
        localStorage.setItem('loggedInUser', username);
        toast({ title: 'Inicio de Sesión Exitoso', description: `Bienvenido/a, ${username}!` });
        router.push('/');
      } else {
        toast({ variant: 'destructive', title: 'Error de Inicio de Sesión', description: 'Nombre de usuario no válido.' });
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <LogoIcon className="h-12 w-auto mb-4" />
          <CardTitle className="text-3xl font-headline">Iniciar Sesión</CardTitle>
          <CardDescription>Accede al panel de SucioStudio.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
            <Button type="submit" className="w-full text-base py-3" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          <p>Este es un sistema de prototipo. No se requiere contraseña.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
