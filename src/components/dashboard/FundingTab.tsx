import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { ScenarioData, Round, ESOP } from '@/types/database';
import { SupabaseFunctions } from '@/lib/supabase-functions';
import { useToast } from '@/hooks/use-toast';

interface FundingTabProps {
  scenarioData: ScenarioData | null;
  onUpdate: () => void;
}

export const FundingTab = ({ scenarioData, onUpdate }: FundingTabProps) => {
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundInvestment, setNewRoundInvestment] = useState('');
  const [newRoundValuation, setNewRoundValuation] = useState('');
  const [esopPercentage, setEsopPercentage] = useState(
    scenarioData?.esop[0]?.percentage.toString() || ''
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddRound = async () => {
    if (!scenarioData?.scenario.id || !newRoundName.trim() || !newRoundInvestment || !newRoundValuation) {
      toast({ title: "Please fill in all round details", variant: "destructive" });
      return;
    }
    
    const investment = parseFloat(newRoundInvestment);
    const valuation = parseFloat(newRoundValuation);
    
    if (isNaN(investment) || isNaN(valuation) || investment <= 0 || valuation <= 0) {
      toast({ title: "Please enter valid investment and valuation amounts", variant: "destructive" });
      return;
    }

    setLoading(true);
    const round = await SupabaseFunctions.addRound(scenarioData.scenario.id, {
      round_name: newRoundName.trim(),
      investment,
      valuation
    });
    
    if (round) {
      toast({ title: "Funding round added successfully" });
      setNewRoundName('');
      setNewRoundInvestment('');
      setNewRoundValuation('');
      onUpdate();
    } else {
      toast({ title: "Failed to add funding round", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleUpdateRound = async (round: Round, updates: Partial<Round>) => {
    setLoading(true);
    const success = await SupabaseFunctions.updateRound(round.id, updates);
    
    if (success) {
      toast({ title: "Round updated successfully" });
      onUpdate();
    } else {
      toast({ title: "Failed to update round", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleDeleteRound = async (roundId: string) => {
    if (!confirm('Are you sure you want to delete this funding round?')) return;
    
    setLoading(true);
    const success = await SupabaseFunctions.deleteRound(roundId);
    
    if (success) {
      toast({ title: "Funding round deleted successfully" });
      onUpdate();
    } else {
      toast({ title: "Failed to delete funding round", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleUpdateEsop = async () => {
    if (!scenarioData?.scenario.id || !esopPercentage) return;
    
    const percentage = parseFloat(esopPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast({ title: "Please enter a valid ESOP percentage (0-100)", variant: "destructive" });
      return;
    }

    setLoading(true);
    let success = false;
    
    if (scenarioData.esop.length > 0) {
      // Update existing ESOP
      success = await SupabaseFunctions.updateEsop(scenarioData.esop[0].id, { percentage });
    } else {
      // Create new ESOP
      const esop = await SupabaseFunctions.addEsop(scenarioData.scenario.id, { percentage });
      success = !!esop;
    }
    
    if (success) {
      toast({ title: "ESOP updated successfully" });
      onUpdate();
    } else {
      toast({ title: "Failed to update ESOP", variant: "destructive" });
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Funding Round</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="round-name">Round Name</Label>
              <Input
                id="round-name"
                placeholder="e.g., Seed, Series A"
                value={newRoundName}
                onChange={(e) => setNewRoundName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment">Investment ($)</Label>
              <Input
                id="investment"
                type="number"
                placeholder="1000000"
                value={newRoundInvestment}
                onChange={(e) => setNewRoundInvestment(e.target.value)}
                min="0"
                step="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valuation">Valuation ($)</Label>
              <Input
                id="valuation"
                type="number"
                placeholder="5000000"
                value={newRoundValuation}
                onChange={(e) => setNewRoundValuation(e.target.value)}
                min="0"
                step="1000"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddRound} disabled={loading} className="w-full flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Round
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funding Rounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scenarioData?.rounds.map((round) => (
              <div key={round.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <Input
                  value={round.round_name}
                  onChange={(e) => handleUpdateRound(round, { round_name: e.target.value })}
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Investment:</Label>
                  <Input
                    type="number"
                    value={round.investment}
                    onChange={(e) => handleUpdateRound(round, { investment: parseFloat(e.target.value) || 0 })}
                    className="w-32"
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Valuation:</Label>
                  <Input
                    type="number"
                    value={round.valuation}
                    onChange={(e) => handleUpdateRound(round, { valuation: parseFloat(e.target.value) || 0 })}
                    className="w-32"
                    min="0"
                    step="1000"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteRound(round.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {scenarioData?.rounds.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No funding rounds added yet. Add your first round above.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ESOP Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="esop-percentage">ESOP Percentage</Label>
              <Input
                id="esop-percentage"
                type="number"
                placeholder="10"
                value={esopPercentage}
                onChange={(e) => setEsopPercentage(e.target.value)}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleUpdateEsop} disabled={loading}>
                Update ESOP
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};