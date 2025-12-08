import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart, Film, Tv, Star, DollarSign, Send, Check } from 'lucide-react';
import { UserProfile } from '@/services/profilesApiService';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SponsorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
}

type ContentType = 'movie_short' | 'movie_long' | 'episode' | 'custom';

export function SponsorModal({ open, onOpenChange, profile }: SponsorModalProps) {
  const [step, setStep] = useState(1);
  const [contentType, setContentType] = useState<ContentType>('movie_short');
  const [contentTitle, setContentTitle] = useState('');
  const [priority, setPriority] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const contentOptions = [
    { 
      id: 'movie_short', 
      label: 'Filme Curto', 
      description: 'Até 90 minutos',
      price: profile.moviePriceShort || 0,
      icon: Film
    },
    { 
      id: 'movie_long', 
      label: 'Filme Longo', 
      description: 'Acima de 90 minutos',
      price: profile.moviePriceLong || 0,
      icon: Film
    },
    { 
      id: 'episode', 
      label: 'Episódio de Série', 
      description: 'Por episódio',
      price: profile.episodePrice || 0,
      icon: Tv
    },
  ];

  const selectedOption = contentOptions.find(o => o.id === contentType);
  const basePrice = selectedOption?.price || 0;
  const priorityPrice = priority ? (profile.priorityPrice || 0) : 0;
  const totalPrice = basePrice + priorityPrice;

  const handleSubmit = () => {
    // Save sponsorship request to localStorage
    const request = {
      id: Date.now().toString(),
      creatorId: profile.id,
      creatorUsername: profile.username,
      creatorName: profile.name,
      contentType,
      contentTitle,
      priority,
      message,
      totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('sponsorship_requests') || '[]');
    existing.push(request);
    localStorage.setItem('sponsorship_requests', JSON.stringify(existing));

    setSubmitted(true);
    toast({ title: 'Solicitação enviada com sucesso!' });
  };

  const handleClose = () => {
    setStep(1);
    setContentType('movie_short');
    setContentTitle('');
    setPriority(false);
    setMessage('');
    setSubmitted(false);
    onOpenChange(false);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Solicitação Enviada!</h2>
            <p className="text-muted-foreground mb-6">
              Sua solicitação de patrocínio foi enviada para {profile.name}. 
              Você receberá uma resposta em breve.
            </p>
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Patrocinar {profile.name}</h2>
              <p className="text-sm text-muted-foreground font-normal">@{profile.username}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Escolha o tipo de conteúdo:</p>
            
            <div className="space-y-3">
              {contentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setContentType(option.id as ContentType)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                      contentType === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      contentType === option.id ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Icon className={cn("w-6 h-6", contentType === option.id ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      R$ {option.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Priority Option */}
            <button
              onClick={() => setPriority(!priority)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                priority
                  ? "border-warning bg-warning/5"
                  : "border-border hover:border-warning/30"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                priority ? "bg-warning/10" : "bg-muted"
              )}>
                <Star className={cn("w-6 h-6", priority ? "text-warning fill-warning" : "text-muted-foreground")} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Prioridade</p>
                <p className="text-sm text-muted-foreground">Seu conteúdo será produzido mais rapidamente</p>
              </div>
              <p className="text-lg font-bold text-warning">
                +R$ {(profile.priorityPrice || 0)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </button>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={() => setStep(2)}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título do Conteúdo *</Label>
              <Input
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                placeholder="Ex: Breaking Bad, The Office..."
              />
            </div>

            <div className="space-y-2">
              <Label>Mensagem para o Criador</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Alguma observação ou pedido especial? (opcional)"
                rows={3}
              />
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
              <h4 className="font-semibold text-sm">Resumo do Pedido</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{selectedOption?.label}</span>
                  <span>R$ {basePrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {priority && (
                  <div className="flex justify-between text-warning">
                    <span>Prioridade</span>
                    <span>+R$ {priorityPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">R$ {totalPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleSubmit}
                disabled={!contentTitle.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Solicitação
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
