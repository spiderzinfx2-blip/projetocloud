import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, DollarSign, Link, Image, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface CreatorProfile {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  banner: string;
  specialties: string[];
  moviePriceShort: number;
  moviePriceLong: number;
  episodePrice: number;
  priorityPrice: number;
  socialLinks: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  isPublic: boolean;
}

interface CreatorProfileConfigProps {
  profile: CreatorProfile | null;
  onSave: (profile: CreatorProfile) => void;
}

const defaultProfile: CreatorProfile = {
  username: '',
  displayName: '',
  bio: '',
  avatar: '',
  banner: '',
  specialties: [],
  moviePriceShort: 0,
  moviePriceLong: 0,
  episodePrice: 0,
  priorityPrice: 0,
  socialLinks: {},
  isPublic: false
};

export function CreatorProfileConfig({ profile, onSave }: CreatorProfileConfigProps) {
  const [formData, setFormData] = useState<CreatorProfile>(profile || defaultProfile);
  const [newSpecialty, setNewSpecialty] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast({ title: 'Perfil de criador salvo com sucesso!' });
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()]
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Configurar Perfil de Criador</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Perfil Público:</span>
          <button
            onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
            className={`w-12 h-6 rounded-full transition-colors ${
              formData.isPublic ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
              formData.isPublic ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Informações Básicas</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-muted border border-r-0 border-border rounded-l-lg text-muted-foreground">@</span>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  placeholder="seuusername"
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Nome de Exibição</Label>
              <Input
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Seu Nome"
              />
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <Label>Bio</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Fale sobre você e seu conteúdo..."
              rows={3}
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Imagens</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>URL do Avatar</Label>
              <Input
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>URL do Banner</Label>
              <Input
                value={formData.banner}
                onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          
          {/* Preview */}
          {(formData.avatar || formData.banner) && (
            <div className="mt-4 rounded-lg overflow-hidden border border-border">
              {formData.banner && (
                <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${formData.banner})` }} />
              )}
              <div className="p-4 flex items-center gap-3">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{formData.displayName || 'Seu Nome'}</p>
                  <p className="text-sm text-muted-foreground">@{formData.username || 'username'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Specialties */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Especialidades</h3>
          </div>
          
          <div className="flex gap-2 mb-3">
            <Input
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              placeholder="Ex: Filmes de Ação, Séries de Terror..."
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
            />
            <Button type="button" onClick={addSpecialty} variant="outline">
              Adicionar
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.specialties.map((specialty) => (
              <Badge
                key={specialty}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeSpecialty(specialty)}
              >
                {specialty} ×
              </Badge>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Preços de Patrocínio</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Filme Curto (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.moviePriceShort}
                onChange={(e) => setFormData({ ...formData, moviePriceShort: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Filme Longo (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.moviePriceLong}
                onChange={(e) => setFormData({ ...formData, moviePriceLong: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Episódio (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.episodePrice}
                onChange={(e) => setFormData({ ...formData, episodePrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Prioridade (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.priorityPrice}
                onChange={(e) => setFormData({ ...formData, priorityPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Redes Sociais</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>YouTube</Label>
              <Input
                value={formData.socialLinks.youtube || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                })}
                placeholder="https://youtube.com/@..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input
                value={formData.socialLinks.instagram || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                })}
                placeholder="https://instagram.com/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Twitter/X</Label>
              <Input
                value={formData.socialLinks.twitter || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                })}
                placeholder="https://twitter.com/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>TikTok</Label>
              <Input
                value={formData.socialLinks.tiktok || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  socialLinks: { ...formData.socialLinks, tiktok: e.target.value }
                })}
                placeholder="https://tiktok.com/@..."
              />
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Salvar Perfil de Criador
        </Button>
      </form>
    </motion.div>
  );
}
