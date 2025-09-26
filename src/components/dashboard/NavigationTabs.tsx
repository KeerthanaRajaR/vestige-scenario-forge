import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Plus, BarChart3, DollarSign } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const NavigationTabs = ({ activeTab, onTabChange }: NavigationTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-8">
      <TabsList className="grid w-full grid-cols-4 bg-muted/50">
        <TabsTrigger value="setup" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Setup
        </TabsTrigger>
        <TabsTrigger value="funding" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Funding
        </TabsTrigger>
        <TabsTrigger value="analysis" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analysis
        </TabsTrigger>
        <TabsTrigger value="exit" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Exit
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};