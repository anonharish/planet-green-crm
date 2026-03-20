import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { useLoginMutation } from '../api/authApi';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  const { login } = useAuth();
  const [loginApi, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      // Call the real API
      const response = await loginApi({ login_id: email, password }).unwrap();
      
      // The API returns is_first_login as an integer 0 or 1
      const isFirst = Boolean(response.is_first_login);
      
      login(
        response.token, 
        response.refreshToken, 
        isFirst, 
        { 
          id: String(response.id), 
          email: response.login_id, 
          name: `${response.first_name} ${response.last_name}` 
        }
      );
    } catch (err: any) {
      console.error('Login failed:', err);
      setLocalError(
        err?.data?.message || err?.error || 'Invalid credentials or server unavailable.'
      );
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
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="superadmin@gmail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              disabled={isLoading}
            />
          </div>
          {localError && <p className="text-sm text-red-500 font-medium">{localError}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
