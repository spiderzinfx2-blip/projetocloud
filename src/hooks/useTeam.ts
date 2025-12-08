import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: 'owner' | 'member';
  addedAt: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  members: TeamMember[];
  sharedTabs: string[];
  createdAt: string;
}

export interface TeamInvite {
  teamId: string;
  teamName: string;
  ownerName: string;
  ownerEmail: string;
}

const TEAMS_KEY = 'teams_data';
const ACTIVE_TEAM_KEY = 'active_team';

export function useTeam() {
  const { user } = useAuth();
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [joinedTeams, setJoinedTeams] = useState<TeamInvite[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all teams from localStorage
  const loadTeams = useCallback(() => {
    const teamsData = localStorage.getItem(TEAMS_KEY);
    return teamsData ? JSON.parse(teamsData) as Team[] : [];
  }, []);

  // Save all teams to localStorage
  const saveTeams = useCallback((teams: Team[]) => {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
    // Dispatch event for other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: TEAMS_KEY }));
  }, []);

  // Initialize and load team data
  useEffect(() => {
    if (!user) {
      setMyTeam(null);
      setJoinedTeams([]);
      setActiveTeamId(null);
      setIsLoading(false);
      return;
    }

    const teams = loadTeams();
    
    // Find team owned by current user
    const ownedTeam = teams.find(t => t.ownerId === user.id);
    setMyTeam(ownedTeam || null);
    
    // Find teams where user is a member
    const memberTeams = teams.filter(t => 
      t.ownerId !== user.id && 
      t.members.some(m => m.email.toLowerCase() === user.email.toLowerCase())
    ).map(t => ({
      teamId: t.id,
      teamName: t.name,
      ownerName: t.ownerName,
      ownerEmail: t.ownerEmail
    }));
    setJoinedTeams(memberTeams);
    
    // Load active team
    const savedActiveTeam = localStorage.getItem(`${ACTIVE_TEAM_KEY}_${user.id}`);
    if (savedActiveTeam) {
      setActiveTeamId(savedActiveTeam);
    }
    
    setIsLoading(false);
  }, [user, loadTeams]);

  // Create a new team
  const createTeam = useCallback((name: string) => {
    if (!user) return null;
    
    const teams = loadTeams();
    
    // Check if user already has a team
    if (teams.some(t => t.ownerId === user.id)) {
      return null;
    }
    
    const newTeam: Team = {
      id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      ownerId: user.id,
      ownerEmail: user.email,
      ownerName: user.name,
      members: [{
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'owner',
        addedAt: new Date().toISOString()
      }],
      sharedTabs: [],
      createdAt: new Date().toISOString()
    };
    
    teams.push(newTeam);
    saveTeams(teams);
    setMyTeam(newTeam);
    
    return newTeam;
  }, [user, loadTeams, saveTeams]);

  // Add a member to the team
  const addMember = useCallback((email: string, name?: string) => {
    if (!user || !myTeam) return false;
    
    const teams = loadTeams();
    const teamIndex = teams.findIndex(t => t.id === myTeam.id);
    
    if (teamIndex === -1) return false;
    
    // Check if member already exists
    if (teams[teamIndex].members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }
    
    const newMember: TeamMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      name,
      role: 'member',
      addedAt: new Date().toISOString()
    };
    
    teams[teamIndex].members.push(newMember);
    saveTeams(teams);
    setMyTeam(teams[teamIndex]);
    
    return true;
  }, [user, myTeam, loadTeams, saveTeams]);

  // Remove a member from the team
  const removeMember = useCallback((memberId: string) => {
    if (!user || !myTeam) return false;
    
    const teams = loadTeams();
    const teamIndex = teams.findIndex(t => t.id === myTeam.id);
    
    if (teamIndex === -1) return false;
    
    // Cannot remove owner
    const member = teams[teamIndex].members.find(m => m.id === memberId);
    if (member?.role === 'owner') return false;
    
    teams[teamIndex].members = teams[teamIndex].members.filter(m => m.id !== memberId);
    saveTeams(teams);
    setMyTeam(teams[teamIndex]);
    
    return true;
  }, [user, myTeam, loadTeams, saveTeams]);

  // Update shared tabs
  const updateSharedTabs = useCallback((tabs: string[]) => {
    if (!user || !myTeam) return false;
    
    const teams = loadTeams();
    const teamIndex = teams.findIndex(t => t.id === myTeam.id);
    
    if (teamIndex === -1) return false;
    
    teams[teamIndex].sharedTabs = tabs;
    saveTeams(teams);
    setMyTeam(teams[teamIndex]);
    
    return true;
  }, [user, myTeam, loadTeams, saveTeams]);

  // Update team name
  const updateTeamName = useCallback((name: string) => {
    if (!user || !myTeam) return false;
    
    const teams = loadTeams();
    const teamIndex = teams.findIndex(t => t.id === myTeam.id);
    
    if (teamIndex === -1) return false;
    
    teams[teamIndex].name = name;
    saveTeams(teams);
    setMyTeam(teams[teamIndex]);
    
    return true;
  }, [user, myTeam, loadTeams, saveTeams]);

  // Delete team
  const deleteTeam = useCallback(() => {
    if (!user || !myTeam) return false;
    
    const teams = loadTeams();
    const filteredTeams = teams.filter(t => t.id !== myTeam.id);
    saveTeams(filteredTeams);
    setMyTeam(null);
    
    return true;
  }, [user, myTeam, loadTeams, saveTeams]);

  // Set active team for guest
  const setActiveTeam = useCallback((teamId: string | null) => {
    if (!user) return;
    
    if (teamId) {
      localStorage.setItem(`${ACTIVE_TEAM_KEY}_${user.id}`, teamId);
    } else {
      localStorage.removeItem(`${ACTIVE_TEAM_KEY}_${user.id}`);
    }
    setActiveTeamId(teamId);
  }, [user]);

  // Get active team data
  const getActiveTeam = useCallback((): Team | null => {
    if (!activeTeamId) return null;
    
    const teams = loadTeams();
    return teams.find(t => t.id === activeTeamId) || null;
  }, [activeTeamId, loadTeams]);

  // Check if a tab should be shared (for guests)
  const isTabShared = useCallback((tabId: string): boolean => {
    const activeTeam = getActiveTeam();
    if (!activeTeam) return false;
    
    return activeTeam.sharedTabs.includes(tabId);
  }, [getActiveTeam]);

  // Leave a team (for members)
  const leaveTeam = useCallback((teamId: string) => {
    if (!user) return false;
    
    const teams = loadTeams();
    const teamIndex = teams.findIndex(t => t.id === teamId);
    
    if (teamIndex === -1) return false;
    
    // Cannot leave if owner
    if (teams[teamIndex].ownerId === user.id) return false;
    
    teams[teamIndex].members = teams[teamIndex].members.filter(
      m => m.email.toLowerCase() !== user.email.toLowerCase()
    );
    
    saveTeams(teams);
    setJoinedTeams(prev => prev.filter(t => t.teamId !== teamId));
    
    if (activeTeamId === teamId) {
      setActiveTeam(null);
    }
    
    return true;
  }, [user, loadTeams, saveTeams, activeTeamId, setActiveTeam]);

  return {
    myTeam,
    joinedTeams,
    activeTeamId,
    isLoading,
    createTeam,
    addMember,
    removeMember,
    updateSharedTabs,
    updateTeamName,
    deleteTeam,
    setActiveTeam,
    getActiveTeam,
    isTabShared,
    leaveTeam,
    hasJoinedTeams: joinedTeams.length > 0,
    isTeamOwner: myTeam !== null
  };
}
