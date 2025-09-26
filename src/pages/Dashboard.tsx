import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, FileText } from 'lucide-react';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { NavigationTabs } from '@/components/dashboard/NavigationTabs';
import { ScenarioSelector } from '@/components/dashboard/ScenarioSelector';
import { SetupTab } from '@/components/dashboard/SetupTab';
import { FundingTab } from '@/components/dashboard/FundingTab';
import { AnalysisTab } from '@/components/dashboard/AnalysisTab';
import { ExitTab } from '@/components/dashboard/ExitTab';
import { Scenario, ScenarioData } from '@/types/database';
import { SupabaseFunctions } from '@/lib/supabase-functions';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [scenarioData, setScenarioData] = useState<ScenarioData | null>(null);
  const [activeTab, setActiveTab] = useState('setup');
  const [loading, setLoading] = useState(true);

  const loadScenarios = async () => {
    const scenariosData = await SupabaseFunctions.getScenarios();
    setScenarios(scenariosData);
    
    if (scenariosData.length > 0 && !currentScenario) {
      setCurrentScenario(scenariosData[0]);
    }
    setLoading(false);
  };

  const loadScenarioData = async (scenarioId: string) => {
    const data = await SupabaseFunctions.getScenarioById(scenarioId);
    setScenarioData(data);
  };

  const handleScenarioChange = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setCurrentScenario(scenario);
      loadScenarioData(scenarioId);
    }
  };

  const handleDataUpdate = () => {
    if (currentScenario) {
      loadScenarioData(currentScenario.id);
    }
  };

  useEffect(() => {
    if (user) {
      loadScenarios();
    }
  }, [user]);

  useEffect(() => {
    if (currentScenario) {
      loadScenarioData(currentScenario.id);
    }
  }, [currentScenario]);

  // Create default scenario if none exist
  useEffect(() => {
    const createDefaultScenario = async () => {
      if (!loading && scenarios.length === 0) {
        const defaultScenario = await SupabaseFunctions.createScenario({
          name: 'My First Scenario',
          founders: [
            { name: 'Founder 1', equity: 50 },
            { name: 'Founder 2', equity: 50 }
          ]
        });
        
        if (defaultScenario) {
          setScenarios([defaultScenario.scenario]);
          setCurrentScenario(defaultScenario.scenario);
          setScenarioData(defaultScenario);
        }
      }
    };

    createDefaultScenario();
  }, [loading, scenarios.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Scenario Builder</h1>
                <p className="text-sm text-muted-foreground">
                  Model startup equity across funding rounds and exits
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <ScenarioSelector
          scenarios={scenarios}
          currentScenario={currentScenario}
          onScenarioChange={handleScenarioChange}
          onScenariosUpdate={loadScenarios}
        />

        <MetricsCards scenarioData={scenarioData} />

        <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'setup' && (
            <SetupTab scenarioData={scenarioData} onUpdate={handleDataUpdate} />
          )}
          {activeTab === 'funding' && (
            <FundingTab scenarioData={scenarioData} onUpdate={handleDataUpdate} />
          )}
          {activeTab === 'analysis' && (
            <AnalysisTab scenarioData={scenarioData} />
          )}
          {activeTab === 'exit' && (
            <ExitTab scenarioData={scenarioData} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;