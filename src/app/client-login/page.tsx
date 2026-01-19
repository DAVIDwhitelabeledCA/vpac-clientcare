'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useAuth,
  useUser,
  initiateEmailSignIn,
  initiateEmailSignUp,
  initiateGoogleSignIn,
  initiateAppleSignIn,
} from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.136,44,30.024,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M19.16,6.38a4,4,0,0,0-3.83-2.61,4.3,4.3,0,0,0-3.83,2.44,4.14,4.14,0,0,0-3.84-2.44,4.34,4.34,0,0,0-4,2.82,10.1,10.1,0,0,0,.1,7.22,5.25,5.25,0,0,0,4.3,2.65,4.39,4.39,0,0,0,3.82-2.5,4.2,4.2,0,0,0,3.83,2.5,5.26,5.26,0,0,0,4.29-2.65A9.6,9.6,0,0,0,19.16,6.38ZM15.8,1.49A3.3,3.3,0,0,1,18,3.22a3.17,3.17,0,0,1-.83,2.22,3.38,3.38,0,0,1-2.43.84,3.21,3.21,0,0,1-1.63-2.61A3.2,3.2,0,0,1,15.8,1.49Z"
      />
    </svg>
  );
}

export default function ClientLoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      // Redirect to client portal
      router.replace('/client');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = (data: LoginFormValues) => {
    if (isLoginView) {
      initiateEmailSignIn(auth, data.email, data.password);
    } else {
      initiateEmailSignUp(auth, data.email, data.password);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Logo />
        </div>
        <CardTitle className="text-2xl">
          {isLoginView ? 'Client Portal Login' : 'Create Client Account'}
        </CardTitle>
        <CardDescription>
          {isLoginView
            ? 'Access your medical records and information.'
            : 'Sign up to access your client portal.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            {isLoginView ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        <div className="relative my-6">
          <Separator />
          <div className="absolute inset-0 flex items-center">
            <span className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => initiateGoogleSignIn(auth)}
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => initiateAppleSignIn(auth)}
          >
            <AppleIcon className="mr-2 h-4 w-4" />
            Apple
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          {isLoginView ? "Don't have an account? " : 'Already have an account? '}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => setIsLoginView(!isLoginView)}
          >
            {isLoginView ? 'Sign up' : 'Sign in'}
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
