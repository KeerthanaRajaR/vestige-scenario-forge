import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScenarioData } from '@/types/database';

interface ExitTabProps {
  scenarioData: ScenarioData | null;
}

export const ExitTab = ({ scenarioData }: ExitTabProps) => {
  const [exitValuation, setExitValuation] = useState('');
  const [exitType, setExitType] = useState('acquisition');
  const [exitResults, setExitResults] = useState<any>(null);

  const calculateExit = () => {
    if (!scenarioData || !exitValuation) return;

    const valuation = parseFloat(exitValuation);
    if (isNaN(valuation) || valuation <= 0) return;

    // Calculate current equity distribution
    const totalInvestment = scenarioData.rounds.reduce((sum, round) => sum + round.investment, 0);
    const founderEquity = scenarioData.founders.reduce((sum, founder) => sum + founder.equity, 0);
    const esopEquity = scenarioData.esop[0]?.percentage || 0;
    
    // Calculate investor equity
    const investorEquity = scenarioData.rounds.reduce((total, round) => {
      const equity = (round.investment / round.valuation) * 100;
      return total + equity;
    }, 0);

    const totalEquity = founderEquity + esopEquity + investorEquity;

    // Calculate diluted equity percentages
    const dilutedFounderEquity = totalEquity > 0 ? (founderEquity / totalEquity) * 100 : founderEquity;
    const dilutedEsopEquity = totalEquity > 0 ? (esopEquity / totalEquity) * 100 : esopEquity;
    const dilutedInvestorEquity = totalEquity > 0 ? (investorEquity / totalEquity) * 100 : investorEquity;

    // Calculate exit proceeds
    const founderProceeds = (dilutedFounderEquity / 100) * valuation;
    const esopProceeds = (dilutedEsopEquity / 100) * valuation;
    const investorProceeds = (dilutedInvestorEquity / 100) * valuation;

    // Calculate returns
    const investorReturn = totalInvestment > 0 ? investorProceeds / totalInvestment : 0;

    // Individual founder breakdown
    const founderBreakdown = scenarioData.founders.map(founder => {
      const currentEquity = totalEquity > 0 ? (founder.equity / totalEquity) * 100 : founder.equity;
      const proceeds = (currentEquity / 100) * valuation;
      return {
        name: founder.name,
        originalEquity: founder.equity,
        currentEquity,
        proceeds
      };
    });

    setExitResults({
      exitValuation: valuation,
      exitType,
      founderProceeds,
      esopProceeds,
      investorProceeds,
      investorReturn,
      founderBreakdown,
      totalInvestment
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(2)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatMultiple = (multiple: number) => {
    return `${multiple.toFixed(1)}x`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exit Scenario Modeling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exit-type">Exit Type</Label>
              <Select value={exitType} onValueChange={setExitType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acquisition">Acquisition</SelectItem>
                  <SelectItem value="ipo">IPO</SelectItem>
                  <SelectItem value="merger">Merger</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exit-valuation">Exit Valuation ($)</Label>
              <Input
                id="exit-valuation"
                type="number"
                placeholder="100000000"
                value={exitValuation}
                onChange={(e) => setExitValuation(e.target.value)}
                min="0"
                step="1000000"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={calculateExit} className="w-full">
                Calculate Exit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {exitResults && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Founder Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">
                    {formatCurrency(exitResults.founderProceeds)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total to Founders</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investor Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-500">
                    {formatCurrency(exitResults.investorProceeds)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatMultiple(exitResults.investorReturn)} return
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ESOP Pool</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-500">
                    {formatCurrency(exitResults.esopProceeds)}
                  </p>
                  <p className="text-sm text-muted-foreground">Employee Pool</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Individual Founder Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Founder</TableHead>
                    <TableHead>Original Equity</TableHead>
                    <TableHead>Current Equity</TableHead>
                    <TableHead>Exit Proceeds</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exitResults.founderBreakdown.map((founder: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{founder.name}</TableCell>
                      <TableCell>{founder.originalEquity.toFixed(2)}%</TableCell>
                      <TableCell>{founder.currentEquity.toFixed(2)}%</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(founder.proceeds)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exit Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exit Type:</span>
                  <span className="font-semibold capitalize">{exitResults.exitType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exit Valuation:</span>
                  <span className="font-semibold">{formatCurrency(exitResults.exitValuation)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Investment:</span>
                  <span className="font-semibold">{formatCurrency(exitResults.totalInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investor Multiple:</span>
                  <span className="font-semibold">{formatMultiple(exitResults.investorReturn)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!exitResults && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Enter an exit valuation and click "Calculate Exit" to see the distribution of proceeds.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};