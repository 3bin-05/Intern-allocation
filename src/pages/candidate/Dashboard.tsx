import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, User, FileText, LogOut } from "lucide-react";

interface Application {
  id: string;
  status: string;
  applied_at: string;
  internships: {
    title: string;
    companies: {
      company_name: string;
    };
  };
}

interface RecommendedInternship {
  id: string;
  title: string;
  description: string;
  location: string;
  stipend: number;
  companies: {
    company_name: string;
  };
}

const CandidateDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendedInternships, setRecommendedInternships] = useState<RecommendedInternship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch applications with internship and company details
      const { data: applicationsData } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_at,
          internships (
            title,
            companies (
              company_name
            )
          )
        `)
        .eq('candidate_id', user.id)
        .order('applied_at', { ascending: false });

      // Fetch recommended internships (for now, just show active ones)
      const { data: internshipsData } = await supabase
        .from('internships')
        .select(`
          id,
          title,
          description,
          location,
          stipend,
          companies (
            company_name
          )
        `)
        .eq('status', 'active')
        .limit(5);

      setApplications(applicationsData || []);
      setRecommendedInternships(internshipsData || []);
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

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'secondary';
      case 'Under Review':
        return 'default';
      case 'Accepted':
        return 'default';
      case 'Rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">GradLinkUp</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/candidate/profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" onClick={() => navigate('/candidate/internships')}>
              <Search className="w-4 h-4 mr-2" />
              Browse Internships
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Here's what's happening with your internship applications</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Applications Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Your Applications
              </CardTitle>
              <CardDescription>
                Track the status of your internship applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No applications yet</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate('/candidate/internships')}
                  >
                    Find Internships
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{app.internships.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {app.internships.companies.company_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applied {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Internships */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>
                Internships that match your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendedInternships.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recommendations available</p>
                  <p className="text-sm mt-2">Complete your profile to get personalized matches</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendedInternships.map((internship) => (
                    <div key={internship.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{internship.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {internship.companies.company_name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm">{internship.location}</span>
                        {internship.stipend && (
                          <span className="text-sm font-medium">
                            ₹{internship.stipend.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => navigate(`/internship/${internship.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;