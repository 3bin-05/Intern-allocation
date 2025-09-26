import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect authenticated users to role selection or their dashboard
      navigate('/role-selection');
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="mb-6 text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          GradLinkUp
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect talented students with amazing internship opportunities. Find your perfect match today.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" onClick={() => navigate('/auth')}>
            Find Internships
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
            Post Opportunities
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
