import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { useUpdatePasswordMutation } from '../api/authApi';
import { toast } from 'sonner';

// ✅ Schema
const schema = z
  .object({
    old_password: z.string().min(1, 'Old password is required'),
    new_password: z.string().min(8, 'Minimum 8 characters required'),
    confirm_password: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export const UpdatePasswordPage = () => {
  const navigate = useNavigate();
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await updatePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      }).unwrap();

      if (res.success) {
        // ✅ SUCCESS POPUP
        toast.success('Your password has been updated successfully');

        // redirect after delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm">

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6">
          Update Password
        </h2>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Old Password */}
            <FormField
              control={form.control}
              name="old_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Old Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Submit'}
            </Button>

          </form>
        </Form>
      </div>
    </div>
  );
};