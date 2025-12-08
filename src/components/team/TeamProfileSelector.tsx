import React from 'react';
import { motion } from 'framer-motion';
import { Users, ChevronRight, Crown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeam, TeamInvite } from '@/hooks/useTeam';
import { cn } from '@/lib/utils';

interface TeamProfileSelectorProps {
  onSelectTeam: (teamId: string) => void;
  onUsePersonal: () => void;
  currentTab?: string;
}

export function TeamProfileSelector({ onSelectTeam, onUsePersonal, currentTab }: TeamProfileSelectorProps) {
  const { joinedTeams, activeTeamId, setActiveTeam, myTeam, getActiveTeam, leaveTeam } = useTeam();

  const handleSelectTeam = (teamId: string) => {
    setActiveTeam(teamId);
    onSelectTeam(teamId);
  };

  const handleUsePersonal = () => {
    setActiveTeam(null);
    onUsePersonal();
  };

  const handleLeaveTeam = (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja sair desta equipe?')) {
      leaveTeam(teamId);
    }
  };

  // If user has their own team, they shouldn't see this selector
  if (myTeam) {
    return null;
  }

  // If no joined teams, return null
  if (joinedTeams.length === 0) {
    return null;
  }

  const activeTeam = getActiveTeam();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-foreground text-sm">Selecionar Perfil</h4>
        </div>
        
        <div className="space-y-2">
          {/* Personal Profile Option */}
          <button
            onClick={handleUsePersonal}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left",
              !activeTeamId
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Crown className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Meu Perfil</p>
                <p className="text-xs text-muted-foreground">Usar minha conta pessoal</p>
              </div>
            </div>
            {!activeTeamId && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
          
          {/* Joined Teams */}
          {joinedTeams.map((team) => (
            <button
              key={team.teamId}
              onClick={() => handleSelectTeam(team.teamId)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left group",
                activeTeamId === team.teamId
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{team.teamName}</p>
                  <p className="text-xs text-muted-foreground">
                    Equipe de {team.ownerName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                  onClick={(e) => handleLeaveTeam(e, team.teamId)}
                >
                  <LogOut className="w-3 h-3 text-destructive" />
                </Button>
                {activeTeamId === team.teamId && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        {activeTeam && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Usando perfil: <span className="font-medium text-foreground">{activeTeam.name}</span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Compact version for header/sidebar
export function TeamProfileBadge() {
  const { activeTeamId, getActiveTeam, setActiveTeam, joinedTeams, myTeam } = useTeam();
  
  // Don't show if user owns a team or has no joined teams
  if (myTeam || joinedTeams.length === 0) {
    return null;
  }

  const activeTeam = getActiveTeam();
  
  if (!activeTeam) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-primary/10 text-xs">
      <Users className="w-3 h-3 text-primary" />
      <span className="text-foreground font-medium">{activeTeam.name}</span>
      <button
        onClick={() => setActiveTeam(null)}
        className="text-muted-foreground hover:text-foreground ml-1"
      >
        ×
      </button>
    </div>
  );
}
