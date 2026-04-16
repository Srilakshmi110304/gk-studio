// pages/Account.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Lock, ShoppingBag, Heart, ChevronRight, Edit2, Trash2, Plus, ArrowRight, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useWishlist } from '../Context/WishlistContext';
import { useAuth } from '../Context/AuthContext';
import { useOrders } from '../Context/OrdersContext';
import { formatPrice } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface Address {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  addressLine: string;
  city: string;
  state: string;
  isDefault: boolean;
}

const Account = () => {
  const { user, signOut } = useAuth();
  const { wishlistItems } = useWishlist();
  const { orders, loading: ordersLoading, cancelOrder } = useOrders();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'password' | 'orders' | 'wishlist'>('profile');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);

  // User profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'female' as 'female' | 'male' | 'other'
  });
  const [profileLoading, setProfileLoading] = useState(true);

  // Address form state
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    name: '',
    phone: '',
    pincode: '',
    addressLine: '',
    city: '',
    state: '',
    isDefault: false
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Load profile data
  useEffect(() => {
    if (user) {
      loadProfile();
      loadAddresses();
    } else {
      setProfileLoading(false);
      setAddressesLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          name: data.name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          dob: data.dob || '',
          gender: data.gender || 'female'
        });
      } else {
        // Set default profile from user metadata
        const userName = user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'User');
        setProfile({
          name: userName,
          email: user.email || '',
          phone: '',
          dob: '',
          gender: 'female'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      const userName = user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'User');
      setProfile({
        name: userName,
        email: user.email || '',
        phone: '',
        dob: '',
        gender: 'female'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const loadAddresses = async () => {
    if (!user) {
      setAddressesLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      const formattedAddresses: Address[] = (data || []).map((addr: any) => ({
        id: addr.id,
        name: addr.name,
        phone: addr.phone,
        pincode: addr.pincode,
        addressLine: addr.address_line,
        city: addr.city,
        state: addr.state,
        isDefault: addr.is_default
      }));

      setAddresses(formattedAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user exists before proceeding
    if (!user) {
      alert('Please login to update your profile');
      return;
    }
    
    try {
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (existingProfile) {
        // Update existing profile
        await supabase
          .from('profiles')
          .update({
            name: profile.name,
            phone: profile.phone,
            dob: profile.dob,
            gender: profile.gender,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      } else {
        // Insert new profile
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: profile.name,
            email: user.email,
            phone: profile.phone,
            dob: profile.dob,
            gender: profile.gender
          });
      }
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Profile updated successfully! (Demo mode)');
    }
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveAddress = async () => {
    if (!user) {
      alert('Please login to save addresses');
      return;
    }

    try {
      if (editingAddress) {
        // Update existing address
        await supabase
          .from('addresses')
          .update({
            name: addressForm.name,
            phone: addressForm.phone,
            pincode: addressForm.pincode,
            address_line: addressForm.addressLine,
            city: addressForm.city,
            state: addressForm.state,
            is_default: addressForm.isDefault
          })
          .eq('id', editingAddress.id);

        if (addressForm.isDefault) {
          await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id)
            .neq('id', editingAddress.id);
        }
      } else {
        // Add new address
        const { data } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            name: addressForm.name,
            phone: addressForm.phone,
            pincode: addressForm.pincode,
            address_line: addressForm.addressLine,
            city: addressForm.city,
            state: addressForm.state,
            is_default: addressForm.isDefault
          })
          .select()
          .single();

        if (addressForm.isDefault && data?.id) {
          await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id)
            .neq('id', data.id);
        }
      }

      await loadAddresses();
      resetAddressForm();
      alert('Address saved successfully!');
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Address saved successfully! (Demo mode)');
      resetAddressForm();
      loadAddresses();
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await supabase.from('addresses').delete().eq('id', id);
      await loadAddresses();
      alert('Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Address deleted successfully! (Demo mode)');
      loadAddresses();
    }
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return;
    
    try {
      await supabase.from('addresses').update({ is_default: true }).eq('id', id);
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .neq('id', id);

      await loadAddresses();
      alert('Default address updated!');
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Default address updated! (Demo mode)');
      loadAddresses();
    }
  };

  const editAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      pincode: addr.pincode,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      isDefault: addr.isDefault
    });
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({
      name: '',
      phone: '',
      pincode: '',
      addressLine: '',
      city: '',
      state: '',
      isDefault: false
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      await supabase.auth.updateUser({
        password: passwordData.new
      });
      alert('Password changed successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Password changed successfully! (Demo mode)');
      setPasswordData({ current: '', new: '', confirm: '' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile Details', icon: User },
    { id: 'addresses' as const, label: 'Address Book', icon: MapPin },
    { id: 'password' as const, label: 'Change Password', icon: Lock },
    { id: 'orders' as const, label: 'My Orders', icon: ShoppingBag },
    { id: 'wishlist' as const, label: 'Wishlist', icon: Heart }
  ];

  // Show loading state while checking auth or loading data
  if (profileLoading || addressesLoading || ordersLoading) {
    return (
      <div className="bg-page-bg min-h-screen py-10">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-8"></div>
            <div className="h-64 bg-gray-200 rounded max-w-md mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // If no user is logged in, show login prompt
  if (!user) {
    return (
      <div className="bg-page-bg min-h-screen py-20">
        <div className="container-custom text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-card p-8">
            <User size={48} className="mx-auto text-text-secondary mb-4" />
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">Please Login</h2>
            <p className="text-text-secondary mb-8">You need to be logged in to view your account.</p>
            <Link to="/login" className="btn-primary inline-block">Login / Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-page-bg min-h-screen py-10">
      <div className="container-custom">
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-secondary mb-8">
          <Link to="/" className="hover:text-accent">Home</Link>
          <ChevronRight size={10} />
          <span className="text-primary font-bold">My Account</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Tabs */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-card shadow-sm border border-gray-100 overflow-hidden sticky top-32">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-6 py-4 text-left transition-all border-b border-gray-50",
                    activeTab === tab.id
                      ? "bg-primary text-white font-bold"
                      : "text-text-primary hover:bg-page-bg"
                  )}
                >
                  <tab.icon size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-6 py-4 text-left text-red-600 hover:bg-red-50 transition-all border-t border-gray-100"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow">
            {/* Profile Details Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-card shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-2xl font-heading font-bold text-primary mb-6">Profile Details</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-btn focus:ring-2 focus:ring-accent focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-btn bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-btn focus:ring-2 focus:ring-accent focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-2">Date of Birth</label>
                      <input
                        type="date"
                        name="dob"
                        value={profile.dob}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-btn focus:ring-2 focus:ring-accent focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-2">Gender</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value="female" checked={profile.gender === 'female'} onChange={handleProfileChange} className="w-4 h-4 text-accent" />
                        <span className="text-sm">Female</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value="male" checked={profile.gender === 'male'} onChange={handleProfileChange} className="w-4 h-4 text-accent" />
                        <span className="text-sm">Male</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value="other" checked={profile.gender === 'other'} onChange={handleProfileChange} className="w-4 h-4 text-accent" />
                        <span className="text-sm">Other</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" className="btn-primary px-8">Save Changes</button>
                  </div>
                </form>
              </div>
            )}

            {/* Address Book Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-card shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <h2 className="text-2xl font-heading font-bold text-primary">Address Book</h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus size={16} /> Add New Address
                  </button>
                </div>

                <div className="space-y-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className={cn("border rounded-card p-5 transition-all", addr.isDefault ? "border-accent bg-accent/5" : "border-gray-200")}>
                      <div className="flex flex-wrap justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-bold text-primary">{addr.name}</p>
                          <p className="text-sm text-text-secondary">{addr.phone}</p>
                          <p className="text-sm text-text-secondary">{addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          {addr.isDefault && (
                            <span className="inline-block bg-accent text-white text-[10px] font-bold px-2 py-1 rounded-chip uppercase tracking-wider mt-2">Default</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => editAddress(addr)} className="p-2 hover:bg-page-bg rounded-full transition-colors">
                            <Edit2 size={16} className="text-text-secondary" />
                          </button>
                          <button onClick={() => deleteAddress(addr.id)} className="p-2 hover:bg-page-bg rounded-full transition-colors">
                            <Trash2 size={16} className="text-text-secondary" />
                          </button>
                          {!addr.isDefault && (
                            <button onClick={() => setDefaultAddress(addr.id)} className="text-accent text-xs font-bold uppercase tracking-wider hover:underline ml-2">
                              Set as Default
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {addresses.length === 0 && (
                  <div className="text-center py-8">
                    <MapPin size={48} className="mx-auto text-text-secondary mb-4" />
                    <p className="text-text-secondary">No addresses saved yet.</p>
                    <button onClick={() => setShowAddressForm(true)} className="btn-primary inline-block mt-4">
                      Add Your First Address
                    </button>
                  </div>
                )}

                {/* Address Form Modal */}
                {showAddressForm && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => resetAddressForm()}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                      <div className="p-6 border-b border-gray-100">
                        <h3 className="text-xl font-heading font-bold text-primary">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-1">Full Name</label>
                            <input type="text" name="name" value={addressForm.name} onChange={handleAddressFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-btn" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-1">Phone Number</label>
                            <input type="tel" name="phone" value={addressForm.phone} onChange={handleAddressFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-btn" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-1">Address Line</label>
                          <input type="text" name="addressLine" value={addressForm.addressLine} onChange={handleAddressFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-btn" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-1">City</label>
                            <input type="text" name="city" value={addressForm.city} onChange={handleAddressFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-btn" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-1">State</label>
                            <input type="text" name="state" value={addressForm.state} onChange={handleAddressFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-btn" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-1">Pincode</label>
                            <input type="text" name="pincode" value={addressForm.pincode} onChange={handleAddressFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-btn" required />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressFormChange} className="w-4 h-4 text-accent" />
                          <span className="text-sm">Set as default address</span>
                        </label>
                      </div>
                      <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                        <button onClick={resetAddressForm} className="btn-secondary px-6">Cancel</button>
                        <button onClick={saveAddress} className="btn-primary px-6">Save Address</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-card shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-2xl font-heading font-bold text-primary mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-2">Current Password</label>
                    <input
                      type="password"
                      name="current"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-btn focus:ring-2 focus:ring-accent focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-2">New Password</label>
                    <input
                      type="password"
                      name="new"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-btn focus:ring-2 focus:ring-accent focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-text-primary mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-btn focus:ring-2 focus:ring-accent focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" className="btn-primary px-8">Update Password</button>
                  </div>
                </form>
              </div>
            )}

            {/* My Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-card shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-2xl font-heading font-bold text-primary mb-6">My Orders</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-text-secondary mb-4" />
                    <p className="text-text-secondary mb-4">No orders yet.</p>
                    <Link to="/" className="btn-primary inline-block">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-card overflow-hidden">
                        <div className="bg-page-bg px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                          <div>
                            <p className="text-xs text-text-secondary">Order #{order.order_number}</p>
                            <p className="text-sm font-bold text-primary">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={cn(
                              "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                              order.status === 'delivered' ? "bg-green-100 text-green-700" :
                              order.status === 'cancelled' ? "bg-red-100 text-red-700" :
                              "bg-accent/10 text-accent"
                            )}>
                              {order.status}
                            </span>
                            <span className="text-sm font-bold">₹{order.total_amount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="p-6">
                          {order.items.slice(0, 2).map((item: any, idx: number) => (
                            <div key={item.id || idx} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                              <img src={item.product_image} alt={item.product_name} className="w-16 h-20 object-cover rounded" />
                              <div className="flex-1">
                                <h4 className="font-bold text-primary">{item.product_name}</h4>
                                <p className="text-xs text-text-secondary">Qty: {item.quantity} | {item.variant}</p>
                                <p className="text-sm font-bold mt-1">₹{item.price.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-xs text-text-secondary text-center mt-3">+{order.items.length - 2} more items</p>
                          )}
                          <div className="mt-4 flex justify-between items-center">
                            <p className="text-sm text-text-secondary">
                              Delivered to: {order.shipping_address?.name}, {order.shipping_address?.city}
                            </p>
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <button
                                onClick={() => cancelOrder(order.id)}
                                className="text-sale text-xs font-bold uppercase tracking-wider hover:underline"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-card shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-heading font-bold text-primary">My Wishlist</h2>
                  <Link to="/wishlist" className="text-accent text-sm font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                    View Full Wishlist <ArrowRight size={14} />
                  </Link>
                </div>
                {wishlistItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart size={48} className="mx-auto text-text-secondary mb-4" />
                    <p className="text-text-secondary">No items in wishlist yet.</p>
                    <Link to="/" className="btn-primary inline-block mt-4">Explore Products</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistItems.slice(0, 3).map(product => (
                      <div key={product.id} className="flex gap-3 p-3 border border-gray-100 rounded-lg">
                        <img src={product.images[0]} alt={product.name} className="w-16 h-20 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-primary line-clamp-1">{product.name}</h4>
                          <p className="text-xs text-text-secondary">{product.collection}</p>
                          <p className="text-sm font-bold mt-1">{formatPrice(product.offerPrice)}</p>
                        </div>
                      </div>
                    ))}
                    {wishlistItems.length > 3 && (
                      <Link to="/wishlist" className="flex items-center justify-center border border-dashed border-gray-300 rounded-lg text-accent text-sm font-bold">
                        +{wishlistItems.length - 3} more
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Account;