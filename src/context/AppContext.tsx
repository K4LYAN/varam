"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../data/products';
import { supabase } from '../utils/supabase/client';

export interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlertsEnabled: boolean;
  lastLogin: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  settings: SecuritySettings;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  shipping: any;
  status: string;
}

interface AppContextType {
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  toastMessage: string;
  addToCart: (product: Product) => void;
  updateCartQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  handleLogin: (user: Partial<User>) => void;
  handleRegister: (user: Partial<User>) => void;
  handleLogout: () => void;
  updateAddresses: (addresses: Address[]) => void;
  updateSettings: (settings: Partial<SecuritySettings>) => void;
  addOrder: (order: Order) => void;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  // Listen to Supabase Auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Read from user_metadata (or use defaults)
          const meta = session.user.user_metadata;
          const userAddresses = meta?.addresses || [];
          const userSettings = meta?.settings || {
            twoFactorEnabled: false,
            loginAlertsEnabled: true,
            lastLogin: new Date().toLocaleString()
          };

          setUser({
            id: session.user.id,
            name: meta?.name || 'User',
            email: session.user.email || '',
            phone: meta?.phone || '',
            addresses: userAddresses,
            settings: userSettings
          });

          // Fetch orders for this user
          const fetchOrders = async () => {
            const { data: dbOrders, error } = await supabase
              .from('orders')
              .select('*')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false });
              
            if (dbOrders && !error) {
              const formattedOrders: Order[] = dbOrders.map(o => ({
                id: o.id,
                date: new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                items: o.items || [],
                total: o.total_amount,
                shipping: o.shipping_address || {},
                status: o.payment_status === 'paid' ? o.fulfillment_status : o.payment_status
              }));
              setOrders(formattedOrders);
            }
          };
          fetchOrders();
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`${product.name} added to cart!`);
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const getCartTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const createUserObject = (partialUser: Partial<User>): User => ({
    id: partialUser.id || `USR-${Math.floor(Math.random() * 90000)}`,
    name: partialUser.name || 'User',
    email: partialUser.email || '',
    phone: partialUser.phone || '',
    addresses: partialUser.addresses || [],
    settings: partialUser.settings || {
      twoFactorEnabled: false,
      loginAlertsEnabled: true,
      lastLogin: new Date().toLocaleString()
    }
  });

  const handleLogin = (newUser: Partial<User>) => {
    setUser(createUserObject(newUser));
    showToast('Successfully logged in!');
  };

  const handleRegister = (newUser: Partial<User>) => {
    setUser(createUserObject(newUser));
    showToast('Account created successfully!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrders([]);
    showToast('Logged out successfully.');
  };

  const updateAddresses = async (addresses: Address[]) => {
    if (user) {
      const updatedUser = { ...user, addresses };
      setUser(updatedUser);
      await supabase.auth.updateUser({
        data: { addresses }
      });
      showToast('Addresses updated successfully.');
    }
  };

  const updateSettings = async (settings: Partial<SecuritySettings>) => {
    if (user) {
      const updatedSettings = { ...user.settings, ...settings };
      const updatedUser = { ...user, settings: updatedSettings };
      setUser(updatedUser);
      await supabase.auth.updateUser({
        data: { settings: updatedSettings }
      });
      showToast('Security settings updated.');
    }
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setCart([]);
  };

  return (
    <AppContext.Provider value={{
      cart, user, orders, toastMessage,
      addToCart, updateCartQuantity, removeFromCart,
      getCartTotal, getCartCount,
      handleLogin, handleRegister, handleLogout, 
      updateAddresses, updateSettings, addOrder, showToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
