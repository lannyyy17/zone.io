'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useAuth } from '@/firebase';
import { WifiIcon } from 'lucide-react';

export function AuthScreen() {
  const auth = useAuth();

  const handleSignIn = () => {
    initiateAnonymousSignIn(auth);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <WifiIcon className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to Zone Explorer
          </CardTitle>
          <CardDescription>
            Sign in to visualize your network signal data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button onClick={handleSignIn} className="w-full">
              Sign In Anonymously
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-xs text-muted-foreground">
            By signing in, you agree to our terms of service.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
