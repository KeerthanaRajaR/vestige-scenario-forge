import { supabase } from "@/integrations/supabase/client";
import { Scenario, Founder, Round, ESOP, ScenarioData, CreateScenarioRequest } from "@/types/database";

export class SupabaseFunctions {
  // Create a new scenario with associated data
  static async createScenario(data: CreateScenarioRequest): Promise<ScenarioData | null> {
    try {
      // Create scenario - user_id is auto-populated by database default
      const { data: scenario, error: scenarioError } = await supabase
        .from('scenarios')
        .insert({ name: data.name } as any)
        .select()
        .single();

      if (scenarioError) throw scenarioError;

      // Create founders
      const foundersToInsert = data.founders.map(founder => ({
        ...founder,
        scenario_id: scenario.id
      }));

      const { data: founders, error: foundersError } = await supabase
        .from('founders')
        .insert(foundersToInsert)
        .select();

      if (foundersError) throw foundersError;

      // Create rounds if provided
      let rounds: Round[] = [];
      if (data.rounds && data.rounds.length > 0) {
        const roundsToInsert = data.rounds.map(round => ({
          ...round,
          scenario_id: scenario.id
        }));

        const { data: roundsData, error: roundsError } = await supabase
          .from('rounds')
          .insert(roundsToInsert)
          .select();

        if (roundsError) throw roundsError;
        rounds = roundsData || [];
      }

      // Create ESOP if provided
      let esop: ESOP[] = [];
      if (data.esop && data.esop.length > 0) {
        const esopToInsert = data.esop.map(e => ({
          ...e,
          scenario_id: scenario.id
        }));

        const { data: esopData, error: esopError } = await supabase
          .from('esop')
          .insert(esopToInsert)
          .select();

        if (esopError) throw esopError;
        esop = esopData || [];
      }

      return {
        scenario: scenario as Scenario,
        founders: founders as Founder[],
        rounds,
        esop
      };
    } catch (error) {
      console.error('Error creating scenario:', error);
      return null;
    }
  }

  // Get all scenarios for the current user
  static async getScenarios(): Promise<Scenario[]> {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Scenario[];
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      return [];
    }
  }

  // Get a complete scenario with all related data
  static async getScenarioById(id: string): Promise<ScenarioData | null> {
    try {
      const [scenarioRes, foundersRes, roundsRes, esopRes] = await Promise.all([
        supabase.from('scenarios').select('*').eq('id', id).single(),
        supabase.from('founders').select('*').eq('scenario_id', id),
        supabase.from('rounds').select('*').eq('scenario_id', id),
        supabase.from('esop').select('*').eq('scenario_id', id)
      ]);

      if (scenarioRes.error) throw scenarioRes.error;

      return {
        scenario: scenarioRes.data as Scenario,
        founders: (foundersRes.data || []) as Founder[],
        rounds: (roundsRes.data || []) as Round[],
        esop: (esopRes.data || []) as ESOP[]
      };
    } catch (error) {
      console.error('Error fetching scenario:', error);
      return null;
    }
  }

  // Update scenario
  static async updateScenario(id: string, updates: Partial<Scenario>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('scenarios')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating scenario:', error);
      return false;
    }
  }

  // Delete scenario and all related data
  static async deleteScenario(id: string): Promise<boolean> {
    try {
      // Delete in order due to foreign key constraints
      await Promise.all([
        supabase.from('founders').delete().eq('scenario_id', id),
        supabase.from('rounds').delete().eq('scenario_id', id),
        supabase.from('esop').delete().eq('scenario_id', id)
      ]);

      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting scenario:', error);
      return false;
    }
  }

  // Add founder to scenario
  static async addFounder(scenarioId: string, founder: Omit<Founder, 'id' | 'scenario_id'>): Promise<Founder | null> {
    try {
      const { data, error } = await supabase
        .from('founders')
        .insert([{ ...founder, scenario_id: scenarioId }])
        .select()
        .single();

      if (error) throw error;
      return data as Founder;
    } catch (error) {
      console.error('Error adding founder:', error);
      return null;
    }
  }

  // Update founder
  static async updateFounder(id: string, updates: Partial<Founder>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('founders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating founder:', error);
      return false;
    }
  }

  // Delete founder
  static async deleteFounder(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('founders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting founder:', error);
      return false;
    }
  }

  // Add funding round
  static async addRound(scenarioId: string, round: Omit<Round, 'id' | 'scenario_id'>): Promise<Round | null> {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .insert([{ ...round, scenario_id: scenarioId }])
        .select()
        .single();

      if (error) throw error;
      return data as Round;
    } catch (error) {
      console.error('Error adding round:', error);
      return null;
    }
  }

  // Update round
  static async updateRound(id: string, updates: Partial<Round>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rounds')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating round:', error);
      return false;
    }
  }

  // Delete round
  static async deleteRound(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting round:', error);
      return false;
    }
  }

  // Add ESOP
  static async addEsop(scenarioId: string, esop: Omit<ESOP, 'id' | 'scenario_id'>): Promise<ESOP | null> {
    try {
      const { data, error } = await supabase
        .from('esop')
        .insert([{ ...esop, scenario_id: scenarioId }])
        .select()
        .single();

      if (error) throw error;
      return data as ESOP;
    } catch (error) {
      console.error('Error adding ESOP:', error);
      return null;
    }
  }

  // Update ESOP
  static async updateEsop(id: string, updates: Partial<ESOP>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('esop')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating ESOP:', error);
      return false;
    }
  }

  // Delete ESOP
  static async deleteEsop(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('esop')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting ESOP:', error);
      return false;
    }
  }
}