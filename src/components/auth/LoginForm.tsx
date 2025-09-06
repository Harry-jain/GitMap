"use client";

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Github, Mail, Chrome, Microsoft } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithProvider, resetPassword, user } = useAuth()
  const { toast } = useToast()

  // Close dialog when user successfully signs in
  useEffect(() => {
    if (user && onSuccess) {
      onSuccess()
    }
  }, [user, onSuccess])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await signIn(email, password)
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      })
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      })
      if (onSuccess) onSuccess()
    }
    
    setLoading(false)
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await signUp(email, password)
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      })
    } else {
      toast({
        title: "Check your email",
        description: "We sent you a confirmation link to complete your registration.",
      })
      if (onSuccess) onSuccess()
    }
    
    setLoading(false)
  }

  const handleProviderSignIn = async (provider: 'google' | 'github' | 'microsoft') => {
    setLoading(true)
    
    const { error } = await signInWithProvider(provider)
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      })
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address first.",
      })
      return
    }

    setLoading(true)
    
    const { error } = await resetPassword(email)
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: error.message,
      })
    } else {
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      })
    }
    
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome to GitMap</CardTitle>
        <CardDescription>
          Sign in to save and sync your repository history across devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <Mail className="mr-2 h-4 w-4" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="text-center">
              <Button
                variant="link"
                onClick={handleResetPassword}
                disabled={loading}
                className="text-sm"
              >
                Forgot your password?
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <Mail className="mr-2 h-4 w-4" />
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleProviderSignIn('google')}
              disabled={loading}
              className="w-full"
            >
              <Chrome className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleProviderSignIn('github')}
              disabled={loading}
              className="w-full"
            >
              <Github className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleProviderSignIn('microsoft')}
              disabled={loading}
              className="w-full"
            >
              <Microsoft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}