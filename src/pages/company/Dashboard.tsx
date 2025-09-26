import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Building2, LogOut, FileText } from "lucide-react";

interface Internship {
  id: string;
  title: string;
  location: string;
  status: string;
  created_at: string;
  applications: Array<{
    id: string;
    status: string;
  }>;
}

const CompanyDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [internships, setInternships] = useState<Internship[]>([]);
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
      // Fetch company's internships with application counts
      const { data: internshipsData } = await supabase
        .from('internships')
        .select(`
          id,
          title,
          location,
          status,
          created_at,
          applications (
            id,
            status
          )
        `)
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      setInternships(internshipsData || []);
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

  const getApplicationStats = (applications: Array<{ status: string }>) => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'Applied').length;
    const accepted = applications.filter(app => app.status === 'Accepted').length;
    
    return { total, pending, accepted };
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
            <Button variant="ghost" onClick={() => navigate('/company/profile')}>
              <Building2 className="w-4 h-4 mr-2" />
              Company Profile
            </Button>
            <Button variant="ghost" onClick={() => navigate('/company/applicants')}>
              <Users className="w-4 h-4 mr-2" />
              View Applicants
            </Button>
            <Button onClick={() => navigate('/company/post-internship')}>
              <Plus className="w-4 h-4 mr-2" />
              Post Internship
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
          <h2 className="text-3xl font-bold mb-2">Company Dashboard</h2>
          <p className="text-muted-foreground">Manage your internships and view applicants</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {internships.filter(i => i.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {internships.reduce((total, internship) => total + internship.applications.length, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {internships.reduce((total, internship) => 
                  total + internship.applications.filter(app => app.status === 'Applied').length, 0
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Internships List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Your Internships
            </CardTitle>
            <CardDescription>
              Manage your posted internship opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {internships.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No internships posted yet</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/company/post-internship')}
                >
                  Post Your First Internship
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {internships.map((internship) => {
                  const stats = getApplicationStats(internship.applications);
                  return (
                    <div key={internship.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{internship.title}</h4>
                        <p className="text-sm text-muted-foreground">{internship.location}</p>
                        <p className="text-xs text-muted-foreground">
                          Posted {new Date(internship.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>Applications: {stats.total}</span>
                          <span>Pending: {stats.pending}</span>
                          <span>Accepted: {stats.accepted}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={internship.status === 'active' ? 'default' : 'secondary'}>
                          {internship.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/company/internship/${internship.id}`)}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;