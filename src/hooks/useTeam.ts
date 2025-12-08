import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export type TabPermission = 'view' | 'edit' | 'full';

export interface MemberPermissions {
  lumina: TabPermission;
  gerenciamento: TabPermission;
  patrocinio: TabPermission;
  dashboard: TabPermission;
  financas: TabPermission;
}

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: 'owner' | 'admin' | 'member';
  permissions: MemberPermissions;
  addedAt: string;
}

export interface InviteCode {
  code: string;
  createdAt: string;
  expiresAt: string;
  usedBy?: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  members: TeamMember[];
  sharedTabs: string[];
  inviteCodes: InviteCode[];
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

const DEFAULT_PERMISSIONS: MemberPermissions = {
  lumina: 'view',
  gerenciamento: 'view',
  patrocinio: 'view',
  dashboard: 'view',
  financas: 'view',
};

const OWNER_PERMISSIONS: MemberPermissions = {
  lumina: 'full',
  gerenciamento: 'full',
  patrocinio: 'full',
  dashboard: 'full',
  financas: 'full',
};

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

  // Generate invite code
  const generateInviteCode = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }, []);

  // Create a new team
  const createTeam = useCallback((name: string) => {
    if (!user) return null;
    
    const teams = loadTeams();
    
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
        permissions: OWNER_PERMISSIONS,
        addedAt: new Date().toISOString()
      }],
      sharedTabs: [],
      inviteCodes: [],
      createdAt: new Date().toISOString()
    };
    
    teams.push(newTeam);
    saveTeams(teams);
    setMyTeam(newTeam);
    
    return newTeam;
  }, [user, loadTeams, saveTeams]);

  // Create invite code
  const createInviteCode = useCallback(() => {
    if (!user || !myTeam) return null;
    
    const teams = loadTeams();
    const teamIndex = teams.findIndex(t => t.id === myTeam.id);
    
    if (teamIndex === -1) return null;
    
    const code = generateInviteCode();
    const newInvite: InviteCode = {
      code,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };
    
    if (!teams[teamIndex].inviteCodes) {
      teams[teamIndex].inviteCodes = [];
    }
    teams[teamIndex].inviteCodes.push(newInvite);
    saveTeams(teams);
    setMyTeam(teams[teamIndex]);
    
    return code;
  }, [user, myTeam, loadTeams, saveTeams, generateInviteCode]);

  // Delete invite code
  const deleteInviteCode = useCallback((code: string) => {
    if (!user || !myTeam) return false;
    
    const teams = loadTeams();
    const teamIndex = teams.findIndex(t => t.id === myTeam.id);
    
    if (teamIndex === -1) return false;
    
    teams[teamIndex].inviteCodes = (teams[teamIndex].inviteCodes || []).filter(i => i.code !== code);
    saveTeams(teams);
    setMyTeam(teams[teamIndex]);
    
    return true;
  }, [user, myTeam, loadTeams, saveTeams]);

  // Join team by code
  const joinTeamByCode = useCallback((code: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };
    
    const teams = loadTeams();
    
    // Find team with this code
    const teamIndex = teams.findIndex(t => 
      t.inviteCodes?.some(i => i.code === code && new Date(i.expiresAt) > new Date() && !i.usedBy)
    );
    
    if (teamIndex === -1) {
      return { success: false, error: 'Código inválido ou expirado' };
    }
    
    const team = teams[teamIndex];
    
    // Check if already a member
    if (team.members.some(m => m.email.toLowerCase() === user.email.toLowerCase())) {
      return { success: false, error: 'Você já é membro desta equipe' };
    }
    
    // Add member
    const newMember: TeamMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: user.email.toLowerCase(),
      name: user.name,
      role: 'member',
      permissions: DEFAULT_PERMISSIONS,
      addedAt: new Date().toISOString()
    };
    
    teams[teamIndex].members.push(newMember);
    
    // Mark code as used
    const codeIndex = teams[teamIndex].inviteCodes.findIndex(i => i.code === code);
    if (codeIndex !== -1) {
      teams[teamIndex].inviteCodes[codeIndex].usedBy = user.email;
    }
    
    saveTeams(teams);
    
    setJoinedTeams(prev => [...prev, {
      teamId: team.id,
      teamName: team.name,
      ownerName: team.ownerName,
      ownerEmail: team.ownerEmail
    }]);
    
    return { success: true, teamName: team.name };
  }, [user, loadTeams, saveTeams]);

  // Add a member to the team
  const addMember = useCallback((email: string, name?: string) => {
    if (!user || !myTeam) return false;
    
    const teams = loadTeams();
    const teamIndex = teams.findIndex(t => t.id === myTeam.id);
    
    if (teamIndex === -1) return false;
    
    if (teams[teamIndex].members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }
    
    const newMember: TeamMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      name,
      role: 'member',
      permissions: DEFAULT_PERMISSIONS,
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
    
    const member = teams[teamIndex].members.find(m => m.id === memberId);
    if (member?.role === 'owner') return false;
    
    teams[teamIndex].members = teams[teamIndex].members.filter(m => m.id !== memberId);
    saveTeams(teams);
    setMyTeam(teams[teamIndex]);
    
    return true;
  }, [user, myTeam, loadTeams, saveTeams]);

  // Update member permissions
  const updateMemberPermissions = useCallback((memberId: string, permissions: Partial<MemberPermissions>) => {
    if (!user || !myTeam) return false;
    
    const teams = loadTeams();
    const teamIndex = teams.findIndex(t => t.id === myTeam.id);
    
    if (teamIndex === -1) return false;
    
    const memberIndex = teams[teamIndex].members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return false;
    
    // Cannot change owner permissions
    if (teams[teamIndex].members[memberIndex].role === 'owner') return false;
    
    teams[teamIndex].members[memberIndex].permissions = {
      ...teams[teamIndex].members[memberIndex].permissions,
      ...permissions
    };
    
    saveTeams(teams);
    setMyTeam(teams[teamIndex]);
    
    return true;
  }, [user, myTeam, loadTeams, saveTeams]);

  // Update member role
  const updateMemberRole = useCallback((memberId: string, role: 'admin' | 'member') => {
    if (!user || !myTeam) return false;
    
    const teams = loadTeams();
    const teamIndex = teams.findIndex(t => t.id === myTeam.id);
    
    if (teamIndex === -1) return false;
    
    const memberIndex = teams[teamIndex].members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return false;
    
    // Cannot change owner role
    if (teams[teamIndex].members[memberIndex].role === 'owner') return false;
    
    teams[teamIndex].members[memberIndex].role = role;
    
    // Admins get full permissions by default
    if (role === 'admin') {
      teams[teamIndex].members[memberIndex].permissions = OWNER_PERMISSIONS;
    }
    
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

  // Get member permissions for current user in active team
  const getMyPermissions = useCallback((): MemberPermissions | null => {
    if (!user) return null;
    
    // If user owns a team, they have full permissions
    if (myTeam) return OWNER_PERMISSIONS;
    
    // If viewing another team, check permissions
    const activeTeam = getActiveTeam();
    if (!activeTeam) return null;
    
    const member = activeTeam.members.find(m => m.email.toLowerCase() === user.email.toLowerCase());
    return member?.permissions || null;
  }, [user, myTeam, getActiveTeam]);

  // Check specific permission
  const hasPermission = useCallback((tab: keyof MemberPermissions, minLevel: TabPermission): boolean => {
    const permissions = getMyPermissions();
    if (!permissions) return false;
    
    const permissionLevels: Record<TabPermission, number> = { view: 1, edit: 2, full: 3 };
    return permissionLevels[permissions[tab]] >= permissionLevels[minLevel];
  }, [getMyPermissions]);

  // Leave a team (for members)
  const leaveTeam = useCallback((teamId: string) => {
    if (!user) return false;
    
    const teams = loadTeams();
    const teamIndex = teams.findIndex(t => t.id === teamId);
    
    if (teamIndex === -1) return false;
    
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
    updateMemberPermissions,
    updateMemberRole,
    updateSharedTabs,
    updateTeamName,
    deleteTeam,
    setActiveTeam,
    getActiveTeam,
    isTabShared,
    leaveTeam,
    hasJoinedTeams: joinedTeams.length > 0,
    isTeamOwner: myTeam !== null,
    createInviteCode,
    deleteInviteCode,
    joinTeamByCode,
    getMyPermissions,
    hasPermission,
  };
}
