import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { ScenarioData, Founder } from '@/types/database';
import { SupabaseFunctions } from '@/lib/supabase-functions';
import { useToast } from '@/hooks/use-toast';

interface SetupTabProps {
  scenarioData: ScenarioData | null;
  onUpdate: () => void;
}

export const SetupTab = ({ scenarioData, onUpdate }: SetupTabProps) => {
  const [scenarioName, setScenarioName] = useState(scenarioData?.scenario.name || '');
  const [newFounderName, setNewFounderName] = useState('');
  const [newFounderEquity, setNewFounderEquity] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateScenarioName = async () => {
    if (!scenarioData?.scenario.id || !scenarioName.trim()) return;
    
    setLoading(true);
    const success = await SupabaseFunctions.updateScenario(scenarioData.scenario.id, {
      name: scenarioName.trim()
    });
    
    if (success) {
      toast({ title: "Scenario name updated successfully" });
      onUpdate();
    } else {
      toast({ title: "Failed to update scenario name", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleAddFounder = async () => {
    if (!scenarioData?.scenario.id || !newFounderName.trim() || !newFounderEquity) return;
    
    const equity = parseFloat(newFounderEquity);
    if (isNaN(equity) || equity <= 0 || equity > 100) {
      toast({ title: "Please enter a valid equity percentage (0-100)", variant: "destructive" });
      return;
    }

    setLoading(true);
    const founder = await SupabaseFunctions.addFounder(scenarioData.scenario.id, {
      name: newFounderName.trim(),
      equity
    });
    
    if (founder) {
      toast({ title: "Founder added successfully" });
      setNewFounderName('');
      setNewFounderEquity('');
      onUpdate();
    } else {
      toast({ title: "Failed to add founder", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleUpdateFounder = async (founder: Founder, updates: Partial<Founder>) => {
    setLoading(true);
    const success = await SupabaseFunctions.updateFounder(founder.id, updates);
    
    if (success) {
      toast({ title: "Founder updated successfully" });
      onUpdate();
    } else {
      toast({ title: "Failed to update founder", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleDeleteFounder = async (founderId: string) => {
    if (!confirm('Are you sure you want to delete this founder?')) return;
    
    setLoading(true);
    const success = await SupabaseFunctions.deleteFounder(founderId);
    
    if (success) {
      toast({ title: "Founder deleted successfully" });
      onUpdate();
    } else {
      toast({ title: "Failed to delete founder", variant: "destructive" });
    }
    setLoading(false);
  };

  const totalEquity = scenarioData?.founders.reduce((sum, founder) => sum + founder.equity, 0) || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scenario Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario-name">Scenario Name</Label>
            <div className="flex gap-2">
              <Input
                id="scenario-name"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="Enter scenario name"
              />
              <Button onClick={handleUpdateScenarioName} disabled={loading}>
                Update
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Founders
            <span className={`text-sm ${totalEquity === 100 ? 'text-green-500' : 'text-yellow-500'}`}>
              {totalEquity.toFixed(1)}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Founder name"
              value={newFounderName}
              onChange={(e) => setNewFounderName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Equity %"
              value={newFounderEquity}
              onChange={(e) => setNewFounderEquity(e.target.value)}
              min="0"
              max="100"
              step="0.1"
            />
            <Button onClick={handleAddFounder} disabled={loading} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Founder
            </Button>
          </div>

          <div className="space-y-2">
            {scenarioData?.founders.map((founder) => (
              <div key={founder.id} className="flex items-center gap-2 p-3 border rounded-lg">
                <Input
                  value={founder.name}
                  onChange={(e) => handleUpdateFounder(founder, { name: e.target.value })}
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={founder.equity}
                    onChange={(e) => handleUpdateFounder(founder, { equity: parseFloat(e.target.value) || 0 })}
                    className="w-24"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteFounder(founder.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {scenarioData?.founders.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No founders added yet. Add founders to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};