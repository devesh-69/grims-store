
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!email || !password) {
        throw new Error("Please enter your email and password.");
      }
      return signIn(email, password);
    },
    onSuccess: () => {
      // The success toast is handled in the AuthContext
      // Navigate will be handled by the AuthContext as well
    },
    onError: (err: any) => {
      toast.error(err.message || "Login failed. Please check your credentials.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-3xl text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Sign in to your account to continue
            </p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-background border-border focus:border-primary transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-background border-border focus:border-primary transition-colors"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loginMutation.isPending || !email || !password}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a 
              href="/register" 
              className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
            >
              Create one here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
