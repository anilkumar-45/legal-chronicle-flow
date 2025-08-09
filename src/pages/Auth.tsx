import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, go to app
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/", { replace: true });
    });
  }, [navigate]);

  const onLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message });
      return;
    }
    toast({ title: "Welcome back", description: "Logged in successfully." });
    navigate("/", { replace: true });
  };

  const onSignup = async () => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message });
      return;
    }
    toast({
      title: "Check your inbox",
      description: "Confirm your email to complete signup, then log in.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md gradient-card shadow-card border-legal-gray-light/30">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-legal-navy text-center">
            Legal Case Diary – Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm text-foreground">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-foreground">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button className="w-full" onClick={onLogin} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm text-foreground">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-foreground">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
              </div>
              <Button className="w-full" onClick={onSignup} disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
