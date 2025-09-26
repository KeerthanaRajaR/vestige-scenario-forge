import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Scenario } from '@/types/database';
import { SupabaseFunctions } from '@/lib/supabase-functions';
import { useToast } from '@/hooks/use-toast';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  currentScenario: Scenario | null;
  onScenarioChange: (scenarioId: string) => void;
  onScenariosUpdate: () => void;
}

export const ScenarioSelector = ({ 
  scenarios, 
  currentScenario, 
  onScenarioChange, 
  onScenariosUpdate 
}: ScenarioSelectorProps) => {
  const [newScenarioName, setNewScenarioName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateScenario = async () => {
    if (!newScenarioName.trim()) {
      toast({ title: "Please enter a scenario name", variant: "destructive" });
      return;
    }

    setLoading(true);
    const scenarioData = await SupabaseFunctions.createScenario({
      name: newScenarioName.trim(),
      founders: [
        { name: 'Founder 1', equity: 50 },
        { name: 'Founder 2', equity: 50 }
      ]
    });

    if (scenarioData) {
      toast({ title: "Scenario created successfully" });
      setNewScenarioName('');
      setIsCreateDialogOpen(false);
      onScenariosUpdate();
      onScenarioChange(scenarioData.scenario.id);
    } else {
      toast({ title: "Failed to create scenario", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this scenario? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    const success = await SupabaseFunctions.deleteScenario(scenarioId);
    
    if (success) {
      toast({ title: "Scenario deleted successfully" });
      onScenariosUpdate();
      
      // If we deleted the current scenario, select the first available one
      if (currentScenario?.id === scenarioId && scenarios.length > 1) {
        const remainingScenarios = scenarios.filter(s => s.id !== scenarioId);
        if (remainingScenarios.length > 0) {
          onScenarioChange(remainingScenarios[0].id);
        }
      }
    } else {
      toast({ title: "Failed to delete scenario", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1">
        <Select
          value={currentScenario?.id || ''}
          onValueChange={onScenarioChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a scenario" />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((scenario) => (
              <SelectItem key={scenario.id} value={scenario.id}>
                {scenario.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Scenario
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Scenario</DialogTitle>
            <DialogDescription>
              Create a new equity scenario with default founders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <Input
                id="scenario-name"
                placeholder="e.g., My Startup - Series A"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateScenario} disabled={loading}>
                {loading ? 'Creating...' : 'Create Scenario'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {currentScenario && scenarios.length > 1 && (
        <Button
          variant="outline" 
          size="sm"
          onClick={() => handleDeleteScenario(currentScenario.id)}
          disabled={loading}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};