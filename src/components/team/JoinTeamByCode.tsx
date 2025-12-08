import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeam } from '@/hooks/useTeam';
import { toast } from '@/hooks/use-toast';

interface JoinTeamByCodeProps {
  onJoined?: () => void;
}

export function JoinTeamByCode({ onJoined }: JoinTeamByCodeProps) {
  const { joinTeamByCode, myTeam } = useTeam();
  const [code, setCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // If user owns a team, they can't join others
  if (myTeam) {
    return null;
  }

  const handleJoin = async () => {
    if (!code.trim()) {
      toast({ title: 'Digite o código de convite', variant: 'destructive' });
      return;
    }

    setIsJoining(true);
    
    // Simulate async for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = joinTeamByCode(code.trim().toUpperCase());
    
    if (result.success) {
      toast({ title: `Você entrou na equipe ${result.teamName}!` });
      setCode('');
      onJoined?.();
    } else {
      toast({ title: result.error, variant: 'destructive' });
    }
    
    setIsJoining(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Key className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Entrar em uma Equipe</h3>
          <p className="text-sm text-muted-foreground">Use um código de convite para entrar em uma equipe</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Código de Convite</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: ABC12345"
            className="font-mono text-lg tracking-widest text-center"
            maxLength={8}
          />
        </div>

        <Button 
          onClick={handleJoin} 
          className="w-full" 
          disabled={isJoining || !code.trim()}
        >
          {isJoining ? (
            <>Entrando...</>
          ) : (
            <>
              <Users className="w-4 h-4 mr-2" />
              Entrar na Equipe
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
