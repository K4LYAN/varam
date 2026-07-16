"use client";

import { useState, useEffect } from 'react';
import { LogOut, Receipt, Package, MapPin, Settings, CreditCard, FileText, Download, ArrowRight, Leaf, ChevronRight, ShieldCheck, User, Plus, Trash2, Smartphone, History, MessageSquare, HelpCircle, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import type { Order, Address } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { supabase } from '../../utils/supabase/client';

// --- ZOD SCHEMAS ---
const addressSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  label: z.string().min(1, 'Label is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(10, 'Full address is required'),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().min(6, 'Valid pincode required')
});
type AddressFormValues = z.infer<typeof addressSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Must be at least 8 characters').regex(/[A-Z]/, 'Needs uppercase').regex(/[0-9]/, 'Needs number'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type PasswordFormValues = z.infer<typeof passwordSchema>;

const supportSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
type SupportFormValues = z.infer<typeof supportSchema>;

export default function ProfileClient() {
  const { user, orders, handleLogout, showToast, updateAddresses, updateSettings, authLoading } = useAppContext();
  const router = useRouter();
  
  const [profileTab, setProfileTab] = useState('billing');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  
  // States for interactive forms
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [verifyEmailLoading, setVerifyEmailLoading] = useState(false);
  const [verifyEmailMsg, setVerifyEmailMsg] = useState('');
  const [showCurrentPassReveal, setShowCurrentPassReveal] = useState(false);
  const [showNewPassReveal, setShowNewPassReveal] = useState(false);

  // Support states & hooks
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [ticketError, setTicketError] = useState(false);

  // Forms
  const { register: regAddress, handleSubmit: handleAddressSubmit, reset: resetAddress, formState: { errors: errAddress } } = useForm<AddressFormValues>({ resolver: zodResolver(addressSchema) });
  const { register: regPass, handleSubmit: handlePassSubmit, reset: resetPass, formState: { errors: errPass } } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });
  const { register: regSupport, handleSubmit: handleSupportSubmit, reset: resetSupport, formState: { errors: errSupport } } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: { priority: 'normal' }
  });

  const fetchTickets = async () => {
    setLoadingTickets(true);
    setTicketError(false);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err: any) {
      console.warn('Error fetching tickets:', err.message);
      setTicketError(true);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (profileTab === 'support' && user) {
      fetchTickets();
    }
  }, [profileTab, user]);

  const onSubmitSupport = async (data: SupportFormValues) => {
    if (!user) return;
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: user.name,
          user_email: user.email,
          subject: data.subject,
          message: data.message,
          priority: data.priority,
          user_id: user.id
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit support request');
      }

      showToast('Support ticket submitted successfully!');
      resetSupport();
      fetchTickets();
    } catch (err: any) {
      showToast(err.message || 'Something went wrong.');
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center pt-24 pb-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C4C3B]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const onAddAddress = (data: AddressFormValues) => {
    const newAddress: Address = {
      id: `addr_${Math.random()}`,
      label: data.label,
      fullName: data.fullName,
      phone: data.phone,
      address: data.address,
      city: data.city,
      pincode: data.pincode,
      isDefault: user.addresses.length === 0
    };
    updateAddresses([...user.addresses, newAddress]);
    setShowAddressForm(false);
    resetAddress();
  };

  const removeAddress = (id: string) => {
    updateAddresses(user.addresses.filter(a => a.id !== id));
  };

  const onChangePassword = async (data: PasswordFormValues) => {
    setPassError('');
    setPassSuccess('');
    if (!user) return;

    // Re-authenticate first with current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: data.currentPassword,
    });
    if (signInError) {
      setPassError('Current password is incorrect. Please try again.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: data.newPassword });
    if (error) {
      setPassError(error.message);
    } else {
      setPassSuccess('Password updated successfully.');
      showToast('Password updated securely.');
      setShowPasswordFields(false);
      resetPass();
    }
  };

  const resendVerificationEmail = async () => {
    if (!user) return;
    setVerifyEmailLoading(true);
    setVerifyEmailMsg('');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setVerifyEmailLoading(false);
    if (error) {
      setVerifyEmailMsg('Failed to resend. Please try again later.');
    } else {
      setVerifyEmailMsg('Verification email sent! Check your inbox.');
    }
  };

  const toggle2FA = () => {
    updateSettings({ twoFactorEnabled: !user.settings.twoFactorEnabled });
  };

  const TabButton = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button 
      onClick={() => { setProfileTab(id); setSelectedInvoiceOrder(null); setShowAddressForm(false); }}
      className={`flex items-center w-full text-left px-6 py-4 transition-colors relative z-10 ${profileTab === id ? 'text-[#2C4C3B] font-bold' : 'text-[#666666] hover:bg-[#FAF8F5] hover:text-[#1A1A1A]'}`}
    >
      {profileTab === id && (
        <motion.div layoutId="activeTab" className="absolute left-0 top-0 bottom-0 w-1 bg-[#2C4C3B] z-20" />
      )}
      {profileTab === id && (
        <motion.div layoutId="activeTabBg" className="absolute inset-0 bg-[#FAF8F5] -z-10" />
      )}
      <Icon className={`h-5 w-5 mr-3 ${profileTab === id ? 'text-[#2C4C3B]' : ''}`} />
      <span className="text-sm uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Header */}
        <div className="mb-8 flex items-center justify-between">
           <div>
             <h2 className="text-3xl font-serif text-[#1A1A1A]">My Account</h2>
             <p className="text-[#666666] mt-2">Manage your security, orders, and details.</p>
           </div>
           {user.settings.twoFactorEnabled && (
             <div className="hidden md:flex items-center bg-[#E8F5E9] text-[#2E7D32] px-4 py-2 rounded-full border border-[#A5D6A7]">
               <ShieldCheck className="h-4 w-4 mr-2" />
               <span className="text-xs font-bold uppercase tracking-wider">High Security Enabled</span>
             </div>
           )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4 shrink-0">
            <div className="bg-white border border-[#E5E5E5] overflow-hidden lg:sticky lg:top-28 rounded-sm shadow-sm">
               <div className="p-6 border-b border-[#E5E5E5] flex items-center bg-gradient-to-br from-white to-[#FAF8F5]">
                  <div className="h-14 w-14 bg-[#2C4C3B] text-[#F3E5AB] rounded-full flex items-center justify-center text-2xl font-serif mr-4 shadow-inner">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                     <h3 className="font-serif text-[#1A1A1A] text-lg truncate">{user.name}</h3>
                     <p className="text-xs truncate mt-1 flex items-center gap-1">
                       {user.emailVerified ? (
                         <><ShieldCheck className="h-3 w-3 text-[#2C4C3B]" /><span className="text-[#2C4C3B] font-semibold">Email Verified</span></>
                       ) : (
                         <><AlertCircle className="h-3 w-3 text-amber-500" /><span className="text-amber-600 font-semibold">Verify Email</span></>
                       )}
                     </p>
                  </div>
               </div>
               <div className="py-2 relative">
                 <TabButton id="billing" icon={Receipt} label="Billing & Invoices" />
                 <TabButton id="orders" icon={Package} label="Order History" />
                 <TabButton id="addresses" icon={MapPin} label="Saved Addresses" />
                 <TabButton id="settings" icon={Settings} label="Security Settings" />
                 <TabButton id="support" icon={MessageSquare} label="Customer Support" />
               </div>
               <div className="p-4 border-t border-[#E5E5E5] bg-[#FAF8F5]">
                 <button onClick={() => { handleLogout(); router.push('/'); }} className="flex items-center text-[#8B5A2B] hover:text-[#1A1A1A] transition-colors w-full px-2 py-2 text-sm font-bold uppercase tracking-wider">
                   <LogOut className="h-4 w-4 mr-3" /> Sign Out
                 </button>
               </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
             <AnimatePresence mode="wait">
               <motion.div
                 key={profileTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
               >
                 {profileTab === 'billing' && (
                    <div className="space-y-8">
                      <div className="bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-sm">
                         <h3 className="text-xl font-serif text-[#1A1A1A] mb-6 flex items-center border-b border-[#E5E5E5] pb-4">
                           <CreditCard className="h-5 w-5 text-[#8B5A2B] mr-3" /> Billing Overview
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                               <h4 className="text-xs font-bold text-[#666666] uppercase tracking-widest mb-3">Saved Payment Methods</h4>
                               <div className="bg-[#FAF8F5] p-4 border border-[#E5E5E5] flex items-center justify-between rounded-sm">
                                  <div className="flex items-center">
                                    <div className="w-10 h-6 bg-[#1A1A1A] rounded flex items-center justify-center mr-3">
                                       <span className="text-white text-[8px] font-bold">VISA</span>
                                    </div>
                                    <span className="text-sm text-[#1A1A1A] font-medium">•••• •••• •••• 4242</span>
                                  </div>
                                  <span className="text-xs text-[#666666]">Exp 12/28</span>
                               </div>
                               <button className="mt-4 text-xs font-bold text-[#2C4C3B] uppercase tracking-wider hover:underline">+ Add New Payment Method</button>
                            </div>
                         </div>
                      </div>

                      <div className="bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-sm">
                         <h3 className="text-xl font-serif text-[#1A1A1A] mb-6 flex items-center border-b border-[#E5E5E5] pb-4">
                           <FileText className="h-5 w-5 text-[#8B5A2B] mr-3" /> Recent Invoices
                         </h3>
                         
                         {orders.length === 0 ? (
                           <p className="text-[#666666] text-sm py-4">No billing history available yet.</p>
                         ) : (
                           <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                 <thead>
                                   <tr className="border-b border-[#E5E5E5]">
                                     <th className="py-3 text-xs font-bold text-[#666666] uppercase tracking-widest">Invoice ID</th>
                                     <th className="py-3 text-xs font-bold text-[#666666] uppercase tracking-widest">Date</th>
                                     <th className="py-3 text-xs font-bold text-[#666666] uppercase tracking-widest">Amount</th>
                                     <th className="py-3 text-xs font-bold text-[#666666] uppercase tracking-widest">Status</th>
                                     <th className="py-3 text-xs font-bold text-[#666666] uppercase tracking-widest text-right">Action</th>
                                   </tr>
                                 </thead>
                                 <tbody>
                                   {orders.map(order => (
                                     <tr key={order.id} className="border-b border-[#FAF8F5] hover:bg-[#FAF8F5] transition-colors">
                                        <td className="py-4 text-sm font-serif text-[#1A1A1A]">INV-{order.id.split('-')[1]}</td>
                                        <td className="py-4 text-sm text-[#666666]">{order.date}</td>
                                        <td className="py-4 text-sm font-medium text-[#1A1A1A]">₹{order.total}</td>
                                        <td className="py-4 text-sm">
                                           <span className="inline-flex items-center px-2 py-1 bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold uppercase tracking-wider rounded">
                                             <ShieldCheck className="h-3 w-3 mr-1" /> Paid
                                           </span>
                                        </td>
                                        <td className="py-4 text-right">
                                           <button 
                                              onClick={() => { setProfileTab('orders'); setSelectedInvoiceOrder(order); }}
                                              className="text-[#8B5A2B] hover:text-[#1A1A1A] text-xs font-bold uppercase tracking-wider inline-flex items-center transition-colors"
                                           >
                                              <Download className="h-4 w-4 mr-1" /> PDF
                                           </button>
                                        </td>
                                     </tr>
                                   ))}
                                 </tbody>
                              </table>
                           </div>
                         )}
                      </div>
                    </div>
                 )}

                 {/* ORDER HISTORY TAB */}
                 {profileTab === 'orders' && (
                    <div className="bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-sm">
                       {selectedInvoiceOrder ? (
                          <div className="animate-fadeIn">
                             <button onClick={() => setSelectedInvoiceOrder(null)} className="flex items-center text-sm font-bold text-[#666666] hover:text-[#1A1A1A] uppercase tracking-wider mb-8 transition-colors">
                               <ArrowRight className="h-4 w-4 mr-2 rotate-180" /> Back to History
                             </button>
                             <div className="border border-[#E5E5E5] p-8 bg-white relative overflow-hidden rounded-sm shadow-sm">
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                                  <Leaf className="h-96 w-96" />
                                </div>
                                
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#E5E5E5] pb-8 mb-8 relative z-10">
                                   <div className="mb-6 md:mb-0">
                                      <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">TAX INVOICE</h2>
                                      <p className="text-sm text-[#666666]">Invoice #: INV-{selectedInvoiceOrder.id.split('-')[1]}</p>
                                      <p className="text-sm text-[#666666]">Order #: {selectedInvoiceOrder.id}</p>
                                      <p className="text-sm text-[#666666]">Date: {selectedInvoiceOrder.date}</p>
                                   </div>
                                   <div className="md:text-right">
                                      <div className="inline-flex items-center md:justify-end mb-2">
                                        <Leaf className="h-5 w-5 text-[#2C4C3B] mr-2" />
                                        <span className="font-serif text-xl font-bold tracking-widest text-[#1A1A1A]">VARAM</span>
                                      </div>
                                      <p className="text-xs text-[#666666] leading-relaxed">
                                        Organic Varam Pvt Ltd.<br/>
                                        123 Heritage Farm Road<br/>
                                        Agriculture District, 500001<br/>
                                        GSTIN: 29XXXXX1234X1ZX
                                      </p>
                                   </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
                                   <div>
                                      <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-2 border-b border-[#E5E5E5] pb-1">Billed To</h3>
                                      <p className="text-sm text-[#4A4A4A] leading-relaxed">
                                        <span className="font-bold text-[#1A1A1A]">{selectedInvoiceOrder.shipping.fullName || user.name}</span><br/>
                                        {selectedInvoiceOrder.shipping.address || (user.addresses.length > 0 ? user.addresses[0].address : 'No Address Provided')}<br/>
                                        {selectedInvoiceOrder.shipping.city || 'Agriculture District'} - {selectedInvoiceOrder.shipping.pincode || '500001'}<br/>
                                        Ph: {selectedInvoiceOrder.shipping.phone || user.phone}
                                      </p>
                                   </div>
                                   <div>
                                      <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest mb-2 border-b border-[#E5E5E5] pb-1">Shipped To</h3>
                                      <p className="text-sm text-[#4A4A4A] leading-relaxed">
                                        <span className="font-bold text-[#1A1A1A]">{selectedInvoiceOrder.shipping.fullName}</span><br/>
                                        {selectedInvoiceOrder.shipping.address}<br/>
                                        {selectedInvoiceOrder.shipping.city} - {selectedInvoiceOrder.shipping.pincode}<br/>
                                        Ph: {selectedInvoiceOrder.shipping.phone}
                                      </p>
                                   </div>
                                </div>

                                <div className="overflow-x-auto relative z-10">
                                  <table className="w-full text-left mb-8 min-w-[500px]">
                                     <thead>
                                       <tr className="bg-[#FAF8F5] border-y border-[#E5E5E5]">
                                         <th className="py-3 px-4 text-xs font-bold text-[#1A1A1A] uppercase tracking-widest">Item Description</th>
                                         <th className="py-3 px-4 text-xs font-bold text-[#1A1A1A] uppercase tracking-widest text-center">Qty</th>
                                         <th className="py-3 px-4 text-xs font-bold text-[#1A1A1A] uppercase tracking-widest text-right">Rate</th>
                                         <th className="py-3 px-4 text-xs font-bold text-[#1A1A1A] uppercase tracking-widest text-right">Amount</th>
                                       </tr>
                                     </thead>
                                     <tbody>
                                       {selectedInvoiceOrder.items.map((item, idx) => (
                                         <tr key={idx} className="border-b border-[#E5E5E5]">
                                           <td className="py-4 px-4 text-sm font-serif text-[#1A1A1A]">
                                              {item.name}
                                              <span className="block text-xs text-[#666666] font-sans mt-1">{item.volume} | HSN: 1513</span>
                                           </td>
                                           <td className="py-4 px-4 text-sm text-center text-[#4A4A4A]">{item.quantity}</td>
                                           <td className="py-4 px-4 text-sm text-right text-[#4A4A4A]">₹{item.price}</td>
                                           <td className="py-4 px-4 text-sm text-right font-medium text-[#1A1A1A]">₹{item.price * item.quantity}</td>
                                         </tr>
                                       ))}
                                     </tbody>
                                  </table>
                                </div>

                                <div className="flex justify-end relative z-10">
                                   <div className="w-full md:w-1/2 space-y-2 text-sm">
                                      <div className="flex justify-between px-4">
                                         <span className="text-[#666666]">Taxable Amount</span>
                                         <span className="font-medium">₹{selectedInvoiceOrder.total - 50}</span>
                                      </div>
                                      <div className="flex justify-between px-4">
                                         <span className="text-[#666666]">Shipping Charges</span>
                                         <span className="font-medium">₹50</span>
                                      </div>
                                      <div className="flex justify-between px-4 pt-4 border-t border-[#1A1A1A] mt-2">
                                         <span className="font-bold text-[#1A1A1A] uppercase tracking-wider">Invoice Total</span>
                                         <span className="font-serif text-xl text-[#2C4C3B] font-bold">₹{selectedInvoiceOrder.total}</span>
                                      </div>
                                   </div>
                                </div>
                                
                                <div className="mt-12 pt-8 border-t border-[#E5E5E5] text-center relative z-10">
                                   <p className="text-xs text-[#666666] uppercase tracking-widest mb-2">Authorized Signatory</p>
                                   <div className="font-serif text-[#8B5A2B] text-xl italic">Organic Varam</div>
                                   <p className="text-[10px] text-[#999999] mt-4">This is a computer generated invoice and does not require a physical signature.</p>
                                 </div>
                              </div>
                              
                              <div className="mt-6 flex justify-end">
                                 <button onClick={() => showToast('Invoice PDF downloaded successfully.')} className="bg-[#2C4C3B] text-white px-6 py-3 text-sm font-bold uppercase tracking-wider flex items-center hover:bg-[#1A3025] transition-colors rounded-sm shadow-md">
                                    <Download className="h-4 w-4 mr-2" /> Download PDF
                                 </button>
                              </div>
                           </div>
                        ) : (
                           <>
                              <h3 className="text-xl font-serif text-[#1A1A1A] mb-6 flex items-center border-b border-[#E5E5E5] pb-4">
                                <Package className="h-5 w-5 text-[#8B5A2B] mr-3" /> Order History
                              </h3>
                              {orders.length === 0 ? (
                                <div className="text-center py-12">
                                  <Package className="h-12 w-12 mx-auto text-[#CCCCCC] mb-4" strokeWidth={1} />
                                  <p className="text-[#666666] font-serif text-lg mb-6">No previous orders found.</p>
                                  <button onClick={() => router.push('/shop')} className="text-[#2C4C3B] font-bold uppercase tracking-wider text-sm hover:underline">Start Shopping</button>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {orders.map(order => (
                                    <div key={order.id} className="border border-[#E5E5E5] hover:border-[#2C4C3B] transition-colors group rounded-sm overflow-hidden">
                                      <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#E5E5E5] flex flex-wrap justify-between items-center gap-4">
                                         <div>
                                           <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-1">Order Placed</p>
                                           <p className="text-[#1A1A1A] font-medium text-sm">{order.date}</p>
                                         </div>
                                         <div>
                                           <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-1">Total</p>
                                           <p className="text-[#1A1A1A] font-medium text-sm">₹{order.total}</p>
                                         </div>
                                         <div>
                                           <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-1">Order #</p>
                                           <p className="text-[#1A1A1A] font-medium text-sm">{order.id}</p>
                                         </div>
                                         <div className="flex space-x-3">
                                            <button onClick={() => setSelectedInvoiceOrder(order)} className="text-[#2C4C3B] text-xs font-bold uppercase tracking-wider hover:underline flex items-center">
                                               View Invoice <ChevronRight className="h-4 w-4 ml-1" />
                                            </button>
                                         </div>
                                      </div>
                                      <div className="p-6 flex flex-wrap items-center gap-4">
                                         <div className="flex -space-x-4">
                                           {order.items.slice(0, 3).map((item, idx) => (
                                             <div key={idx} className={`h-12 w-12 rounded-full border-2 border-white relative overflow-hidden shadow-sm`} style={{ zIndex: 30 - idx }}>
                                                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                                             </div>
                                           ))}
                                           {order.items.length > 3 && (
                                             <div className="h-12 w-12 rounded-full bg-[#FAF8F5] border-2 border-white flex items-center justify-center shadow-sm relative z-0">
                                                <span className="text-xs font-bold text-[#666666]">+{order.items.length - 3}</span>
                                             </div>
                                           )}
                                         </div>
                                         <div className="flex-grow">
                                           <p className="text-sm font-medium text-[#1A1A1A]">
                                             {order.items.map(i => i.name).join(', ').substring(0, 50)}...
                                           </p>
                                           <p className="text-xs text-[#666666] mt-1">Status: <span className="text-[#2C4C3B] font-bold">{order.status}</span></p>
                                         </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                           </>
                        )}
                    </div>
                 )}

                 {/* SAVED ADDRESSES TAB */}
                 {profileTab === 'addresses' && (
                    <div className="bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-sm">
                       <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-4 mb-6">
                         <h3 className="text-xl font-serif text-[#1A1A1A] flex items-center">
                           <MapPin className="h-5 w-5 text-[#8B5A2B] mr-3" /> Saved Addresses
                         </h3>
                         {!showAddressForm && (
                           <button onClick={() => setShowAddressForm(true)} className="flex items-center text-xs font-bold text-white bg-[#2C4C3B] hover:bg-[#1A3025] px-4 py-2 rounded-sm transition-colors uppercase tracking-wider">
                             <Plus className="h-4 w-4 mr-1" /> Add New
                           </button>
                         )}
                       </div>

                       {showAddressForm ? (
                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-[#FAF8F5] p-6 border border-[#E5E5E5] rounded-sm mb-8">
                           <h4 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-[#E5E5E5] pb-2 text-[#1A1A1A]">Add New Address</h4>
                           <form onSubmit={handleAddressSubmit(onAddAddress)} className="space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                   <label className="block text-xs font-bold text-[#666666] uppercase mb-1">Label (e.g. Home, Office)</label>
                                   <input {...regAddress('label')} className="w-full p-3 border border-[#E5E5E5] focus:border-[#2C4C3B] outline-none text-sm rounded-sm" />
                                   {errAddress.label && <p className="text-red-500 text-xs mt-1">{errAddress.label.message}</p>}
                                 </div>
                                 <div>
                                   <label className="block text-xs font-bold text-[#666666] uppercase mb-1">Full Name</label>
                                   <input {...regAddress('fullName')} className="w-full p-3 border border-[#E5E5E5] focus:border-[#2C4C3B] outline-none text-sm rounded-sm" />
                                   {errAddress.fullName && <p className="text-red-500 text-xs mt-1">{errAddress.fullName.message}</p>}
                                 </div>
                                 <div>
                                   <label className="block text-xs font-bold text-[#666666] uppercase mb-1">Phone Number</label>
                                   <input {...regAddress('phone')} className="w-full p-3 border border-[#E5E5E5] focus:border-[#2C4C3B] outline-none text-sm rounded-sm" />
                                   {errAddress.phone && <p className="text-red-500 text-xs mt-1">{errAddress.phone.message}</p>}
                                 </div>
                                 <div>
                                   <label className="block text-xs font-bold text-[#666666] uppercase mb-1">City</label>
                                   <input {...regAddress('city')} className="w-full p-3 border border-[#E5E5E5] focus:border-[#2C4C3B] outline-none text-sm rounded-sm" />
                                   {errAddress.city && <p className="text-red-500 text-xs mt-1">{errAddress.city.message}</p>}
                                 </div>
                                 <div className="md:col-span-2">
                                   <label className="block text-xs font-bold text-[#666666] uppercase mb-1">Full Address</label>
                                   <input {...regAddress('address')} className="w-full p-3 border border-[#E5E5E5] focus:border-[#2C4C3B] outline-none text-sm rounded-sm" />
                                   {errAddress.address && <p className="text-red-500 text-xs mt-1">{errAddress.address.message}</p>}
                                 </div>
                                 <div>
                                   <label className="block text-xs font-bold text-[#666666] uppercase mb-1">Pincode</label>
                                   <input {...regAddress('pincode')} className="w-full p-3 border border-[#E5E5E5] focus:border-[#2C4C3B] outline-none text-sm rounded-sm" />
                                   {errAddress.pincode && <p className="text-red-500 text-xs mt-1">{errAddress.pincode.message}</p>}
                                 </div>
                               </div>
                               <div className="flex justify-end space-x-4 pt-4 mt-4 border-t border-[#E5E5E5]">
                                 <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#666666] hover:text-[#1A1A1A]">Cancel</button>
                                 <button type="submit" className="px-6 py-2 bg-[#2C4C3B] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#1A3025] rounded-sm shadow-sm transition-colors">Save Address</button>
                               </div>
                           </form>
                         </motion.div>
                       ) : null}

                       {user.addresses.length === 0 ? (
                         <div className="text-center py-12">
                           <MapPin className="h-12 w-12 mx-auto text-[#CCCCCC] mb-4" strokeWidth={1} />
                           <p className="text-[#666666] font-serif text-lg">No saved addresses yet.</p>
                         </div>
                       ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {user.addresses.map((addr) => (
                             <div key={addr.id} className="border border-[#E5E5E5] p-6 rounded-sm relative group hover:border-[#2C4C3B] transition-colors">
                               {addr.isDefault && (
                                 <span className="absolute top-4 right-4 bg-[#F3E5AB] text-[#8B5A2B] text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">Default</span>
                               )}
                               <h4 className="font-bold text-[#1A1A1A] mb-2 uppercase text-xs tracking-wider flex items-center">
                                 {addr.label}
                               </h4>
                               <div className="text-sm text-[#4A4A4A] leading-relaxed mb-4">
                                 <p className="font-bold text-[#1A1A1A]">{addr.fullName}</p>
                                 <p>{addr.address}</p>
                                 <p>{addr.city} - {addr.pincode}</p>
                                 <p>Ph: {addr.phone}</p>
                               </div>
                               <div className="flex space-x-3 pt-4 border-t border-[#E5E5E5]">
                                 <button onClick={() => removeAddress(addr.id)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider flex items-center transition-colors">
                                   <Trash2 className="h-3 w-3 mr-1" /> Remove
                                 </button>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                 )}

                 {/* SECURITY SETTINGS TAB */}
                 {profileTab === 'settings' && (
                    <div className="space-y-8">
                       <div className="bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-sm">
                         <h3 className="text-xl font-serif text-[#1A1A1A] mb-6 flex items-center border-b border-[#E5E5E5] pb-4">
                           <Settings className="h-5 w-5 text-[#8B5A2B] mr-3" /> Security Settings
                         </h3>

                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Personal Info */}
                            <div>
                               <h4 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-4 flex items-center">
                                 <User className="h-4 w-4 mr-2" /> Account Details
                               </h4>
                               <div className="space-y-4">
                                 <div>
                                   <label className="block text-xs font-bold text-[#666666] uppercase mb-1">Full Name</label>
                                   <input type="text" disabled value={user.name} className="w-full p-3 bg-[#FAF8F5] border border-[#E5E5E5] text-sm text-[#666666] cursor-not-allowed rounded-sm" />
                                 </div>
                                 <div>
                                   <label className="block text-xs font-bold text-[#666666] uppercase mb-1">Email Address</label>
                                   <div className="relative">
                                     <input type="email" disabled value={user.email} className="w-full p-3 bg-[#FAF8F5] border border-[#E5E5E5] text-sm text-[#666666] cursor-not-allowed rounded-sm pr-28" />
                                     {user.emailVerified ? (
                                       <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#2C4C3B] text-[10px] font-bold uppercase">
                                         <ShieldCheck className="h-3.5 w-3.5" /> Verified
                                       </span>
                                     ) : (
                                       <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-amber-600 text-[10px] font-bold uppercase">
                                         <AlertCircle className="h-3.5 w-3.5" /> Unverified
                                       </span>
                                     )}
                                   </div>
                                 </div>

                                 {/* Email Verification Banner */}
                                 {!user.emailVerified && (
                                   <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
                                     <p className="text-amber-800 text-sm font-medium mb-3 flex items-start gap-2">
                                       <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                       Your email is not verified. Verify it to secure your account and enable all features.
                                     </p>
                                     <button
                                       onClick={resendVerificationEmail}
                                       disabled={verifyEmailLoading}
                                       className="text-xs font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-sm transition-colors disabled:opacity-60"
                                     >
                                       {verifyEmailLoading ? 'Sending…' : 'Resend Verification Email'}
                                     </button>
                                     {verifyEmailMsg && (
                                       <p className={`text-xs mt-2 font-medium ${verifyEmailMsg.includes('sent') ? 'text-green-700' : 'text-red-600'}`}>
                                         {verifyEmailMsg}
                                       </p>
                                     )}
                                   </div>
                                 )}

                                 {user.emailVerified && (
                                   <div className="bg-green-50 border border-green-200 rounded-sm p-3 flex items-center gap-2">
                                     <ShieldCheck className="h-4 w-4 text-green-700 shrink-0" />
                                     <p className="text-green-800 text-xs font-medium">Your email is verified. Your account is secure.</p>
                                   </div>
                                 )}

                                 <p className="text-[10px] text-[#999999] italic">Contact support to update your name or email address.</p>
                               </div>
                            </div>

                            {/* Security Controls */}
                            <div>
                               <h4 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-4 flex items-center">
                                 <ShieldCheck className="h-4 w-4 mr-2" /> Authentication
                               </h4>
                               {passSuccess && <p className="text-green-600 text-xs font-medium bg-green-50 border border-green-200 p-2 rounded mb-3">{passSuccess}</p>}
                               {!showPasswordFields ? (
                                 <button onClick={() => setShowPasswordFields(true)} className="w-full mb-6 p-4 border border-[#E5E5E5] hover:border-[#2C4C3B] text-left rounded-sm transition-colors flex justify-between items-center group">
                                   <div>
                                     <span className="block text-sm font-bold text-[#1A1A1A] mb-1">Change Password</span>
                                     <span className="block text-xs text-[#666666]">We verify your current password before any changes</span>
                                   </div>
                                   <ChevronRight className="h-5 w-5 text-[#cccccc] group-hover:text-[#2C4C3B] transition-colors" />
                                 </button>
                               ) : (
                                 <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handlePassSubmit(onChangePassword)} className="mb-6 p-5 border border-[#E5E5E5] rounded-sm bg-[#FAF8F5] space-y-4">
                                    <p className="text-xs text-[#555] bg-white border border-[#E5E5E5] p-3 rounded-sm flex items-center gap-2">
                                      <ShieldCheck className="h-4 w-4 text-[#2C4C3B] shrink-0" />
                                      Your current password will be verified before updating.
                                    </p>
                                    {passError && <p className="text-red-600 text-xs font-bold bg-red-50 p-2 border border-red-200 rounded">{passError}</p>}
                                    <div>
                                      <label className="block text-xs font-bold text-[#666666] uppercase mb-1">Current Password</label>
                                      <div className="relative">
                                        <input type={showCurrentPassReveal ? 'text' : 'password'} {...regPass('currentPassword')} className="w-full p-3 border border-[#E5E5E5] focus:border-[#2C4C3B] outline-none text-sm rounded-sm pr-12" placeholder="Enter current password" />
                                        <button type="button" onClick={() => setShowCurrentPassReveal(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#333] transition-colors" aria-label="Toggle password visibility">
                                          {showCurrentPassReveal ? '🙈' : '👁'}
                                        </button>
                                      </div>
                                      {errPass.currentPassword && <p className="text-red-500 text-xs mt-1">{errPass.currentPassword.message}</p>}
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-[#666666] uppercase mb-1">New Password</label>
                                      <div className="relative">
                                        <input type={showNewPassReveal ? 'text' : 'password'} {...regPass('newPassword')} className="w-full p-3 border border-[#E5E5E5] focus:border-[#2C4C3B] outline-none text-sm rounded-sm pr-12" placeholder="Min 8 chars, uppercase, number" />
                                        <button type="button" onClick={() => setShowNewPassReveal(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#333] transition-colors" aria-label="Toggle password visibility">
                                          {showNewPassReveal ? '🙈' : '👁'}
                                        </button>
                                      </div>
                                      {errPass.newPassword && <p className="text-red-500 text-xs mt-1">{errPass.newPassword.message}</p>}
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-[#666666] uppercase mb-1">Confirm New Password</label>
                                      <input type="password" {...regPass('confirmPassword')} className="w-full p-3 border border-[#E5E5E5] focus:border-[#2C4C3B] outline-none text-sm rounded-sm" placeholder="Re-enter new password" />
                                      {errPass.confirmPassword && <p className="text-red-500 text-xs mt-1">{errPass.confirmPassword.message}</p>}
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-2">
                                      <button type="button" onClick={() => { setShowPasswordFields(false); resetPass(); setPassError(''); setPassSuccess(''); }} className="text-xs font-bold uppercase text-[#666666] hover:text-[#1A1A1A]">Cancel</button>
                                      <button type="submit" className="bg-[#2C4C3B] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm hover:bg-[#1A3025] transition-colors">Update Password</button>
                                    </div>
                                 </motion.form>
                               )}

                               <div className="flex items-center justify-between p-4 border border-[#E5E5E5] rounded-sm hover:bg-[#FAF8F5] transition-colors">
                                 <div>
                                   <span className="block text-sm font-bold text-[#1A1A1A] mb-1 flex items-center">
                                     <Smartphone className="h-4 w-4 mr-2 text-[#8B5A2B]" /> Two-Factor Auth
                                   </span>
                                   <span className="block text-xs text-[#666666]">Add an extra layer of security</span>
                                 </div>
                                 <button 
                                   onClick={toggle2FA}
                                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${user.settings.twoFactorEnabled ? 'bg-[#2C4C3B]' : 'bg-[#cccccc]'}`}
                                 >
                                   <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                 </button>
                               </div>
                            </div>
                         </div>
                       </div>

                       <div className="bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-sm">
                         <h3 className="text-xl font-serif text-[#1A1A1A] mb-6 flex items-center border-b border-[#E5E5E5] pb-4">
                           <History className="h-5 w-5 text-[#8B5A2B] mr-3" /> Recent Activity
                         </h3>
                         <div className="space-y-4">
                           <div className="flex justify-between items-center p-4 bg-[#FAF8F5] border border-[#E5E5E5] rounded-sm">
                             <div>
                               <p className="text-sm font-bold text-[#1A1A1A]">Login from Current Device</p>
                               <p className="text-xs text-[#666666]">Hyderabad, IN • Mac OS, Safari</p>
                             </div>
                             <span className="text-xs text-[#666666]">{user.settings.lastLogin}</span>
                           </div>
                         </div>
                       </div>
                    </div>
                 )}

                 {profileTab === 'support' && (
                    <div className="space-y-8 animate-fadeIn">
                       <div className="bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-sm">
                         <h3 className="text-xl font-serif text-[#1A1A1A] mb-6 flex items-center border-b border-[#E5E5E5] pb-4">
                           <MessageSquare className="h-5 w-5 text-[#8B5A2B] mr-3" /> Customer Support
                         </h3>

                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Ticket Submission Form */}
                            <div>
                               <h4 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-4 flex items-center">
                                 <AlertCircle className="h-4 w-4 mr-2 text-[#8B5A2B]" /> Submit a Request
                               </h4>
                               <form onSubmit={handleSupportSubmit(onSubmitSupport)} className="space-y-4">
                                  <div>
                                    <label className="block text-xs font-bold text-[#666666] uppercase mb-1">Subject</label>
                                    <input {...regSupport('subject')} placeholder="e.g. Delivery delay, Wrong item received" className="w-full p-3 border border-[#E5E5E5] focus:border-[#2C4C3B] outline-none text-sm rounded-sm" />
                                    {errSupport.subject && <p className="text-red-500 text-xs mt-1">{errSupport.subject.message}</p>}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-[#666666] uppercase mb-1">Priority</label>
                                    <select {...regSupport('priority')} className="w-full p-3 border border-[#E5E5E5] focus:border-[#2C4C3B] bg-white outline-none text-sm rounded-sm">
                                      <option value="low">Low</option>
                                      <option value="normal">Normal</option>
                                      <option value="high">High</option>
                                      <option value="urgent">Urgent</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-[#666666] uppercase mb-1">Message Description</label>
                                    <textarea {...regSupport('message')} rows={5} placeholder="Provide details about your query here..." className="w-full p-3 border border-[#E5E5E5] focus:border-[#2C4C3B] outline-none text-sm rounded-sm resize-none" />
                                    {errSupport.message && <p className="text-red-500 text-xs mt-1">{errSupport.message.message}</p>}
                                  </div>
                                  <button type="submit" className="w-full py-3 bg-[#2C4C3B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1A3025] rounded-sm transition-colors shadow-sm">
                                    Send Support Request
                                  </button>
                               </form>
                            </div>

                            {/* Ticket History */}
                            <div>
                               <h4 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-4 flex items-center">
                                 <Clock className="h-4 w-4 mr-2 text-[#8B5A2B]" /> My Tickets
                               </h4>

                               {loadingTickets ? (
                                 <div className="flex items-center justify-center py-12">
                                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2C4C3B]" />
                                 </div>
                               ) : ticketError ? (
                                 <div className="p-4 bg-amber-50 border border-amber-200 text-amber-950 rounded-sm text-xs space-y-2">
                                   <p className="font-bold">Database Setup Required</p>
                                   <p className="leading-relaxed">The Support Ticket system is pending initialization. The required tables have not been completely created in your Supabase database.</p>
                                   <p className="text-[10px] text-amber-800">To resolve this, copy and run the SQL migration script from the file <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">supabase/migrations/001_admin_schema.sql</code> in your Supabase SQL Editor.</p>
                                 </div>
                               ) : tickets.length === 0 ? (
                                 <div className="text-center py-12 bg-[#FAF8F5] border border-dashed border-[#E5E5E5] rounded-sm">
                                   <MessageSquare className="h-8 w-8 mx-auto text-[#CCCCCC] mb-2" strokeWidth={1.5} />
                                   <p className="text-xs text-[#666666]">You haven't submitted any tickets yet.</p>
                                 </div>
                               ) : (
                                 <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                   {tickets.map((t) => (
                                     <div key={t.id} className="border border-[#E5E5E5] p-4 rounded-sm bg-[#FAF8F5] hover:border-[#8B5A2B] transition-colors duration-200 shadow-sm">
                                       <div className="flex justify-between items-start mb-2">
                                         <span className="font-serif text-sm font-bold text-[#1A1A1A] truncate max-w-[70%]">{t.subject}</span>
                                         <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                           t.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                                           t.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                                           t.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                         }`}>
                                           {t.status}
                                         </span>
                                       </div>
                                       <p className="text-xs text-[#666666] whitespace-pre-wrap leading-relaxed line-clamp-3 mb-2">{t.message}</p>
                                       {t.admin_reply && (
                                         <div className="mt-3 p-3 bg-white border-l-2 border-[#8B5A2B] rounded-sm shadow-inner">
                                           <p className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-wider mb-1">Response from Varam Support:</p>
                                           <p className="text-xs text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{t.admin_reply}</p>
                                         </div>
                                       )}
                                       <div className="mt-2 flex justify-between items-center text-[10px] text-[#999999]">
                                         <span>Priority: <span className="font-medium text-[#666666] capitalize">{t.priority}</span></span>
                                         <span>{new Date(t.created_at).toLocaleDateString()}</span>
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>

                      {/* FAQs section */}
                      <div className="bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-sm">
                         <h3 className="text-xl font-serif text-[#1A1A1A] mb-6 flex items-center border-b border-[#E5E5E5] pb-4">
                           <HelpCircle className="h-5 w-5 text-[#8B5A2B] mr-3" /> FAQs & Troubleshooting
                         </h3>
                         <div className="space-y-4">
                            {[
                              {
                                q: "How do I track my order status?",
                                a: "Once your order has been dispatched, a tracking AWB will be updated in your Order History under the specific invoice. You can use it on the Delhivery website to track real-time delivery status."
                              },
                              {
                                q: "What is your return & replacement policy?",
                                a: "Since we sell pure edible oils, returns are only accepted for damaged, leaking, or incorrect items delivered. Please raise a support request above with your order ID within 7 days of receiving the package."
                              },
                              {
                                q: "Are Varam Oils 100% natural and unrefined?",
                                a: "Yes, all Varam oils are wood pressed or cold pressed using traditional wood ghanis (Chekku) at low temperatures. We do not use chemicals, paraffin, or artificial preservatives, ensuring 100% purity."
                              },
                              {
                                q: "How can I update my billing or shipping address?",
                                a: "Go to the 'Saved Addresses' tab in your account dashboard. You can add new addresses, remove unused ones, or mark a default shipping address for faster checkouts."
                              }
                            ].map((faq, index) => (
                              <div key={index} className="border-b border-[#E5E5E5] pb-4 last:border-0 last:pb-0">
                                 <button 
                                   onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                   type="button"
                                   className="w-full flex justify-between items-center text-left py-2 font-serif text-sm font-bold text-[#1A1A1A] hover:text-[#8B5A2B] transition-colors focus:outline-none"
                                 >
                                    <span>{faq.q}</span>
                                    <span className="text-[#8B5A2B] font-bold text-lg">{activeFaq === index ? '−' : '+'}</span>
                                 </button>
                                 {activeFaq === index && (
                                   <div className="mt-2 text-xs text-[#666666] leading-relaxed animate-fadeIn">
                                     {faq.a}
                                   </div>
                                 )}
                              </div>
                            ))}
                         </div>
                      </div>
                    </div>
                 )}
               </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
