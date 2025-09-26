import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { ScenarioData } from '@/types/database';

interface MetricsCardsProps {
  scenarioData: ScenarioData | null;
}

export const MetricsCards = ({ scenarioData }: MetricsCardsProps) => {
  const totalFunding = scenarioData?.rounds.reduce((sum, round) => sum + round.investment, 0) || 0;
  const fundingRounds = scenarioData?.rounds.length || 0;
  const foundersCount = scenarioData?.founders.length || 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(1)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-card border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Funding</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalFunding)}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Funding Rounds</p>
              <p className="text-2xl font-bold text-foreground">{fundingRounds}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Founders</p>
              <p className="text-2xl font-bold text-foreground">{foundersCount}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};