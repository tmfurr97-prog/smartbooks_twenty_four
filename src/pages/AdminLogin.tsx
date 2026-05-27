import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  if (session) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setLoading(false);
      toast({ title: "Sign in failed", description: error?.message ?? "Unknown error", variant: "destructive" });
      return;
    }

    // Verify admin role
    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    const isAdmin = !roleError && roles?.some((r) => r.role === "admin");

    if (!isAdmin) {
      await supabase.auth.signOut();
      setLoading(false);
      toast({
        title: "Access denied",
        description: "This account does not have admin privileges.",
        variant: "destructive",
      });
      return;
    }

    setLoading(false);
    toast({ title: "Welcome, admin", description: "Signed in successfully." });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/30 shadow-dark">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-gold" />
              </div>
            </div>
            <CardTitle className="font-heading text-xl">Admin Sign In</CardTitle>
            <CardDescription>Restricted access — admin accounts only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button variant="gold" className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Sign In as Admin"}
            </Button>
            <p className="text-center text-xs text-muted-foreground pt-2">
              Not an admin? <Link to="/login" className="text-gold hover:underline">Regular sign in</Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
