import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Check, Clock, AlertCircle, User, Mail, 
  MessageCircle, Film, Tv, DollarSign, Calendar, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { tmdbService } from '@/services/tmdbService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderItem {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  poster: string;
  runtime?: number;
  episodeInfo?: {
    seasonNumber: number;
    episodeNumber: number;
    episodeName: string;
  };
  price: number;
  wantsPriority: boolean;
}

interface SponsorOrder {
  id: string;
  orderCode: string;
  creatorUsername: string;
  items: OrderItem[];
  buyerInfo: {
    name: string;
    contactPlatform: string;
    contactValue: string;
    email: string;
  };
  subtotal: number;
  priorityTotal: number;
  total: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}

export function OrdersTab() {
  const [orders, setOrders] = useState<SponsorOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SponsorOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Load orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const savedOrders = localStorage.getItem('sponsor-orders');
    if (savedOrders) {
      const allOrders: SponsorOrder[] = JSON.parse(savedOrders);
      // Get current creator username
      const savedProfile = localStorage.getItem('creator-profile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        const creatorOrders = allOrders.filter(o => o.creatorUsername === profile.username);
        setOrders(creatorOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: 'paid' | 'completed' | 'cancelled') => {
    const savedOrders = localStorage.getItem('sponsor-orders');
    if (savedOrders) {
      const allOrders: SponsorOrder[] = JSON.parse(savedOrders);
      const updatedOrders = allOrders.map(order => {
        if (order.id === orderId) {
          const updated = { 
            ...order, 
            status: newStatus,
            ...(newStatus === 'paid' ? { paidAt: new Date().toISOString() } : {})
          };
          
          // If marking as paid, add items to organizer
          if (newStatus === 'paid') {
            addItemsToOrganizer(order);
          }
          
          return updated;
        }
        return order;
      });
      
      localStorage.setItem('sponsor-orders', JSON.stringify(updatedOrders));
      loadOrders();
      setShowOrderDetails(false);
      
      toast({ 
        title: newStatus === 'paid' 
          ? 'Pedido marcado como pago! Itens adicionados ao organizador.' 
          : `Status do pedido atualizado para ${newStatus}` 
      });
    }
  };

  const addItemsToOrganizer = (order: SponsorOrder) => {
    const savedOrganizer = localStorage.getItem('organizer-content');
    const organizerContent = savedOrganizer ? JSON.parse(savedOrganizer) : [];
    
    // Group items by content ID for series
    const itemsByContent: { [key: number]: typeof order.items } = {};
    order.items.forEach(item => {
      if (!itemsByContent[item.id]) {
        itemsByContent[item.id] = [];
      }
      itemsByContent[item.id].push(item);
    });
    
    Object.entries(itemsByContent).forEach(([contentId, items]) => {
      const firstItem = items[0];
      const existingIndex = organizerContent.findIndex((c: any) => c.id === parseInt(contentId));
      
      if (firstItem.type === 'tv') {
        // For TV, group all episodes together
        const newEpisodes = items.map(item => ({
          season: item.episodeInfo?.seasonNumber || 1,
          episode: item.episodeInfo?.episodeNumber || 1,
          isPaid: true,
          isPriority: item.wantsPriority,
          sponsorName: order.buyerInfo.name,
          paidDate: new Date().toISOString()
        }));
        
        if (existingIndex >= 0) {
          // Update existing content with new episodes
          const existing = organizerContent[existingIndex];
          const existingEpisodes = existing.sponsoredEpisodes || [];
          
          newEpisodes.forEach(newEp => {
            const epIndex = existingEpisodes.findIndex((e: any) => 
              e.season === newEp.season && e.episode === newEp.episode
            );
            if (epIndex >= 0) {
              existingEpisodes[epIndex] = { ...existingEpisodes[epIndex], ...newEp };
            } else {
              existingEpisodes.push(newEp);
            }
          });
          
          organizerContent[existingIndex] = {
            ...existing,
            sponsoredEpisodes: existingEpisodes,
            sponsorName: order.buyerInfo.name,
            sponsorContact: `${order.buyerInfo.contactPlatform}: ${order.buyerInfo.contactValue}`,
            orderCode: order.orderCode
          };
        } else {
          // Create new content with episodes
          // Determine priority: if any episode has priority, set high priority
          const hasPriority = items.some(i => i.wantsPriority);
          
          organizerContent.push({
            id: parseInt(contentId),
            title: firstItem.title,
            name: firstItem.title,
            media_type: 'tv',
            poster_path: firstItem.poster,
            isPaidAdvanced: true,
            priority: hasPriority ? 4 : 1, // 4 = High priority if any episode has priority
            sponsorName: order.buyerInfo.name,
            sponsorContact: `${order.buyerInfo.contactPlatform}: ${order.buyerInfo.contactValue}`,
            sponsorEmail: order.buyerInfo.email,
            orderCode: order.orderCode,
            addedDate: new Date().toISOString(),
            isWatched: false,
            sponsoredEpisodes: newEpisodes
          });
        }
      } else {
        // For movies, add as single item
        if (existingIndex < 0) {
          organizerContent.push({
            id: parseInt(contentId),
            title: firstItem.title,
            name: firstItem.title,
            media_type: 'movie',
            poster_path: firstItem.poster,
            isPaidAdvanced: true,
            priority: firstItem.wantsPriority ? 4 : 1, // 4 = High priority
            sponsorName: order.buyerInfo.name,
            sponsorContact: `${order.buyerInfo.contactPlatform}: ${order.buyerInfo.contactValue}`,
            sponsorEmail: order.buyerInfo.email,
            orderCode: order.orderCode,
            addedDate: new Date().toISOString(),
            isWatched: false
          });
        }
      }
    });
    
    localStorage.setItem('organizer-content', JSON.stringify(organizerContent));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30"><Check className="w-3 h-3 mr-1" /> Pago</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30"><Check className="w-3 h-3 mr-1" /> Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30"><AlertCircle className="w-3 h-3 mr-1" /> Cancelado</Badge>;
      default:
        return null;
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Pedidos de Patrocínio</h2>
        <Button variant="outline" size="sm" onClick={loadOrders}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">
            Nenhum pedido recebido ainda. Quando alguém patrocinar seu conteúdo, os pedidos aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pedidos Pendentes ({pendingOrders.length})
              </h3>
              <div className="space-y-3">
                {pendingOrders.map(order => (
                  <div 
                    key={order.id}
                    className="bg-card rounded-xl border border-warning/30 p-4 hover:border-warning/50 transition-colors cursor-pointer"
                    onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, i) => (
                            <img 
                              key={i}
                              src={tmdbService.getImageUrl(item.poster, 'w92')}
                              alt={item.title}
                              className="w-10 h-14 object-cover rounded border-2 border-background"
                            />
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-14 rounded border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{order.orderCode}</p>
                          <p className="text-sm text-muted-foreground">{order.buyerInfo.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-lg font-bold text-foreground mt-2">R$ {order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paid/Completed Orders */}
          {paidOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Pedidos Pagos ({paidOrders.length})
              </h3>
              <div className="space-y-3">
                {paidOrders.map(order => (
                  <div 
                    key={order.id}
                    className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => { setSelectedOrder(order); setShowOrderDetails(true); }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, i) => (
                            <img 
                              key={i}
                              src={tmdbService.getImageUrl(item.poster, 'w92')}
                              alt={item.title}
                              className="w-10 h-14 object-cover rounded border-2 border-background"
                            />
                          ))}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{order.orderCode}</p>
                          <p className="text-sm text-muted-foreground">{order.buyerInfo.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-lg font-bold text-success mt-2">R$ {order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Order Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">{selectedOrder.orderCode}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedOrder.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                {/* Buyer Info */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Dados do Comprador
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nome</p>
                      <p className="font-medium">{selectedOrder.buyerInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedOrder.buyerInfo.email}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Contato</p>
                      <p className="font-medium">
                        {selectedOrder.buyerInfo.contactPlatform}: {selectedOrder.buyerInfo.contactValue}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Itens do Pedido ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                        <img 
                          src={tmdbService.getImageUrl(item.poster, 'w92')}
                          alt={item.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.title}</p>
                          {item.episodeInfo && (
                            <p className="text-xs text-muted-foreground">
                              S{item.episodeInfo.seasonNumber.toString().padStart(2, '0')}E{item.episodeInfo.episodeNumber.toString().padStart(2, '0')} - {item.episodeInfo.episodeName}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {item.type === 'movie' ? (
                              <Film className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <Tv className="w-3 h-3 text-muted-foreground" />
                            )}
                            {item.wantsPriority && (
                              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500">Prioridade</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-semibold">R$ {item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R$ {selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedOrder.priorityTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de Prioridade</span>
                      <span>R$ {selectedOrder.priorityTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">R$ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                {selectedOrder.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-success hover:bg-success/90"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'paid')}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Marcar como Pago
                    </Button>
                    <Button 
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}

                {selectedOrder.status === 'paid' && (
                  <Button 
                    className="w-full"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Marcar como Concluído
                  </Button>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
