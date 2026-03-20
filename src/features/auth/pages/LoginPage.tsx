import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../app/store';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { useLoginMutation } from '../api/authApi';
import { useGetUserRolesMutation } from '../api/authApi';
import { setRoles } from '../store/authSlice';

const loginSchema = z.object({
  login_id: z.email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const [loginApi, { isLoading: isLoggingIn }] = useLoginMutation();
  const [getUserRoles, { isLoading: isFetchingRoles }] = useGetUserRolesMutation();

  const isLoading = isLoggingIn || isFetchingRoles;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login_id: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await loginApi(values).unwrap();     
      const isFirst = Boolean(response.is_first_login);
      login(
        response.token,
        response.refreshToken,
        isFirst,
        {
          id: String(response.id),
          email: response.login_id,
          name: `${response.first_name} ${response.last_name}`,
          role_id: response.role_id,
        }
      );

      const roles = await getUserRoles({ offset: 0 }).unwrap();
      dispatch(setRoles(roles));

    } catch (err: any) {
      const message = err?.data?.error || 'Invalid credentials or server unavailable.';
      form.setError('root', { message });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">Planet Green CRM</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to login
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="login_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="superadmin@gmail.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoggingIn
                ? 'Signing In...'
                : isFetchingRoles
                ? 'Loading roles...'
                : 'Sign In'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
