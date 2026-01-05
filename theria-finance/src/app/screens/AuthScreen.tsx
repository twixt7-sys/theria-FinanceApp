import React, { useState } from 'react';
import { TrendingUp, Mail, Lock, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await register(username, email, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-4 rounded-2xl">
              <TrendingUp size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Theria</h1>
          <p className="text-muted-foreground">Manage your finances with clarity</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg transition-all ${
                isLogin ? 'bg-card shadow-sm' : 'hover:bg-card/50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg transition-all ${
                !isLogin ? 'bg-card shadow-sm' : 'hover:bg-card/50'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-input-background"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input-background"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-input-background"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:opacity-90">
              {isLogin ? 'Login' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>Demo Mode • Any credentials accepted</p>
          </div>
        </div>
      </div>
    </div>
  );
};
