import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useUpdatePasswordMutation } from '../api/authApi';

const setPasswordSchema = z
  .object({
    old_password: z.string().min(1, { message: 'Current (temporary) password is required.' }),
    new_password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' }),
      // .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter.' })
      // .regex(/[0-9]/, { message: 'Must contain at least one number.' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
  })
  .refine((data) => data.new_password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

export const SetPasswordPage = () => {
  const { completePasswordSetup } = useAuth();
  const navigate = useNavigate();
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SetPasswordFormValues) => {
    try {
      const response = await updatePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      }).unwrap();

      if (response.success) {
        completePasswordSetup();
        navigate('/leads', { replace: true });
      }
    } catch (err: any) {
      const message = err?.data?.error || err?.data?.message || 'Failed to update password. Please try again.';
      form.setError('root', { message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-center">Set Your Password</CardTitle>
            <CardDescription className="text-center text-zinc-500">
              Welcome! Since this is your first login, please set a secure password before accessing the CRM.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="old_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current (Temporary) Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your temporary password" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" disabled={isLoading} {...field} />
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
                <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Save & Continue to Leads Dashboard'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
