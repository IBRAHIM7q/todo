"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";

interface WelcomeScreenProps {
  onNameSubmit: (name: string) => void;
}

export function WelcomeScreen({ onNameSubmit }: WelcomeScreenProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Pre-fill with saved name if exists
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setName(savedName);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsLoading(true);
      // Save name to localStorage
      localStorage.setItem('userName', name.trim());
      // Small delay for better UX
      setTimeout(() => {
        onNameSubmit(name.trim());
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6bTYgMzR2LTRINGg0djBIMnY0aDR2LTRINGg0djJINGgtNHY0aDQtNHYyaDR2LTRINGg0djJoNHY0aC00ek02IDRWMGgtNHY0SDB2Mmg0djRoMnYtNGg0VjZINGgtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      
      <Card className="w-full max-w-md bg-background/10 backdrop-blur-md border-purple-500/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-purple-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-purple-400" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome to Productivity Hub
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your name to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-purple-300">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/10 border-purple-500/30 text-foreground placeholder-purple-300 focus:border-purple-400"
                autoFocus
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This helps personalize your productivity dashboard
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-500 text-white"
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
                  Getting things ready...
                </span>
              ) : (
                'Continue to Dashboard'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}