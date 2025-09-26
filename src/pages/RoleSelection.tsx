import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2 } from "lucide-react";

const RoleSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user already has a profile/role
    const checkProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role) {
        navigate(profile.role === 'candidate' ? '/candidate/dashboard' : '/company/dashboard');
      }
    };

    checkProfile();
  }, [user, navigate]);

  const handleRoleSelection = async (role: 'candidate' | 'company') => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create profile with selected role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email,
          role: role
        });

      if (profileError) throw profileError;

      // If company role, also create company record
      if (role === 'company') {
        const { error: companyError } = await supabase
          .from('companies')
          .upsert({
            id: user.id,
            company_name: user.user_metadata?.full_name || 'Your Company'
          });

        if (companyError) throw companyError;
      }

      toast({
        title: "Success",
        description: `Welcome to GradLinkUp as a ${role}!`,
      });

      navigate(role === 'candidate' ? '/candidate/dashboard' : '/company/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Role</h1>
          <p className="text-muted-foreground">How would you like to use GradLinkUp?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>I'm a Student</CardTitle>
              <CardDescription>
                Looking for internship opportunities to gain experience and grow my career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleRoleSelection('candidate')}
                disabled={loading}
              >
                Join as Candidate
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
              <CardTitle>I'm a Company</CardTitle>
              <CardDescription>
                Looking to hire talented interns and provide valuable experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleRoleSelection('company')}
                disabled={loading}
              >
                Join as Company
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;