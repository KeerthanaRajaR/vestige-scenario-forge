import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScenarioData } from '@/types/database';

interface AnalysisTabProps {
  scenarioData: ScenarioData | null;
}

export const AnalysisTab = ({ scenarioData }: AnalysisTabProps) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  // Calculate total investment and current valuation
  const totalInvestment = scenarioData?.rounds.reduce((sum, round) => sum + round.investment, 0) || 0;
  const latestValuation = scenarioData?.rounds.length 
    ? Math.max(...scenarioData.rounds.map(round => round.valuation))
    : 0;

  // Calculate equity distribution
  const founderEquity = scenarioData?.founders.reduce((sum, founder) => sum + founder.equity, 0) || 0;
  const esopEquity = scenarioData?.esop[0]?.percentage || 0;
  
  // Calculate investor equity based on rounds
  const investorEquity = scenarioData?.rounds.reduce((total, round) => {
    // Simple calculation: investment / post-money valuation * 100
    const equity = (round.investment / round.valuation) * 100;
    return total + equity;
  }, 0) || 0;

  const totalEquity = founderEquity + esopEquity + investorEquity;

  // Calculate ownership dilution after rounds
  const dilutedFounderEquity = totalEquity > 0 ? (founderEquity / totalEquity) * 100 : founderEquity;
  const dilutedEsopEquity = totalEquity > 0 ? (esopEquity / totalEquity) * 100 : esopEquity;
  const dilutedInvestorEquity = totalEquity > 0 ? (investorEquity / totalEquity) * 100 : investorEquity;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Investment:</span>
              <span className="font-semibold">{formatCurrency(totalInvestment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Latest Valuation:</span>
              <span className="font-semibold">{formatCurrency(latestValuation)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Number of Rounds:</span>
              <span className="font-semibold">{scenarioData?.rounds.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Number of Founders:</span>
              <span className="font-semibold">{scenarioData?.founders.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Founders:</span>
              <span className="font-semibold">{formatPercentage(dilutedFounderEquity)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Investors:</span>
              <span className="font-semibold">{formatPercentage(dilutedInvestorEquity)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ESOP Pool:</span>
              <span className="font-semibold">{formatPercentage(dilutedEsopEquity)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Total:</span>
              <span className="font-semibold">{formatPercentage(100)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Founder Equity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Founder</TableHead>
                <TableHead>Initial Equity</TableHead>
                <TableHead>Current Equity</TableHead>
                <TableHead>Value at Latest Valuation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarioData?.founders.map((founder) => {
                const currentEquity = totalEquity > 0 ? (founder.equity / totalEquity) * 100 : founder.equity;
                const value = (currentEquity / 100) * latestValuation;
                
                return (
                  <TableRow key={founder.id}>
                    <TableCell className="font-medium">{founder.name}</TableCell>
                    <TableCell>{formatPercentage(founder.equity)}</TableCell>
                    <TableCell>{formatPercentage(currentEquity)}</TableCell>
                    <TableCell>{formatCurrency(value)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {scenarioData?.rounds && scenarioData.rounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Funding Rounds Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Valuation</TableHead>
                  <TableHead>Equity Given</TableHead>
                  <TableHead>Price per Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenarioData.rounds.map((round) => {
                  const equityGiven = (round.investment / round.valuation) * 100;
                  const pricePerShare = round.valuation / 1000000; // Assuming 1M shares initially
                  
                  return (
                    <TableRow key={round.id}>
                      <TableCell className="font-medium">{round.round_name}</TableCell>
                      <TableCell>{formatCurrency(round.investment)}</TableCell>
                      <TableCell>{formatCurrency(round.valuation)}</TableCell>
                      <TableCell>{formatPercentage(equityGiven)}</TableCell>
                      <TableCell>${pricePerShare.toFixed(4)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {(!scenarioData?.founders.length && !scenarioData?.rounds.length) && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Add founders and funding rounds to see detailed analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};