import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Signup() {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/30 shadow-navy">
        <CardHeader className="text-center">
          <Link to="/" className="font-heading text-2xl font-bold text-foreground mb-2 inline-block">
            Smart<span className="text-gradient-gold">Books</span>
          </Link>
          <CardTitle className="font-heading text-xl">Create your account</CardTitle>
          <CardDescription>Start managing your taxes with confidence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first">First name</Label>
              <Input id="first" placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last">Last name</Label>
              <Input id="last" placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button variant="gold" className="w-full" size="lg">
            Create Account
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-gold hover:underline">Terms</Link> and{" "}
            <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-gold font-medium hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
