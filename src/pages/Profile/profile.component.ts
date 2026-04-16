// src/app/pages/profile/profile.component.ts
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Address {
  id: number;
  name: string;
  phone: string;
  pincode: string;
  addressLine: string;
  city: string;
  state: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="container-custom">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <a routerLink="/">Home</a> <span>/</span>
          <span class="current">My Profile</span>
        </nav>

        <div class="profile-grid">
          <!-- Left Sidebar (Navigation) -->
          <aside class="profile-sidebar">
            <ul>
              <li class="active">Profile Details</li>
              <li>Address Book</li>
              <li>Change Password</li>
              <li>My Orders</li>
              <li>Wishlist</li>
            </ul>
          </aside>

          <!-- Main Content -->
          <main class="profile-content">
            <!-- Profile Details Section -->
            <section *ngIf="activeTab === 'profile'" class="section-card">
              <h2>Profile Details</h2>
              <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
                <div class="form-row">
                  <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" [(ngModel)]="user.name" name="name" required>
                  </div>
                  <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" [(ngModel)]="user.email" name="email" required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" [(ngModel)]="user.phone" name="phone" required>
                  </div>
                  <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" [(ngModel)]="user.dob" name="dob">
                  </div>
                </div>
                <div class="form-group">
                  <label>Gender</label>
                  <div class="radio-group">
                    <label><input type="radio" value="female" [(ngModel)]="user.gender" name="gender"> Female</label>
                    <label><input type="radio" value="male" [(ngModel)]="user.gender" name="gender"> Male</label>
                    <label><input type="radio" value="other" [(ngModel)]="user.gender" name="gender"> Other</label>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary">Save Changes</button>
                </div>
              </form>
            </section>

            <!-- Address Book Section -->
            <section *ngIf="activeTab === 'addresses'" class="section-card">
              <div class="address-header">
                <h2>Address Book</h2>
                <button class="btn-outline" (click)="showAddressForm = true">+ Add New Address</button>
              </div>

              <!-- Address List -->
              <div class="address-list">
                <div *ngFor="let addr of addresses" class="address-card" [class.default]="addr.isDefault">
                  <div class="address-info">
                    <p class="name">{{ addr.name }}</p>
                    <p class="phone">{{ addr.phone }}</p>
                    <p class="address">{{ addr.addressLine }}, {{ addr.city }}, {{ addr.state }} - {{ addr.pincode }}</p>
                    <span *ngIf="addr.isDefault" class="default-badge">Default</span>
                  </div>
                  <div class="address-actions">
                    <button (click)="editAddress(addr)" class="icon-btn">✎</button>
                    <button (click)="deleteAddress(addr.id)" class="icon-btn trash">🗑</button>
                    <button *ngIf="!addr.isDefault" (click)="setDefault(addr.id)" class="link-btn">Set as Default</button>
                  </div>
                </div>
              </div>

              <!-- Add/Edit Address Form Modal -->
              <div class="modal" *ngIf="showAddressForm">
                <div class="modal-content">
                  <h3>{{ editingAddress ? 'Edit Address' : 'Add New Address' }}</h3>
                  <form (ngSubmit)="saveAddress()">
                    <div class="form-row">
                      <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" [(ngModel)]="addressForm.name" name="addrName" required>
                      </div>
                      <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" [(ngModel)]="addressForm.phone" name="addrPhone" required>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Address Line</label>
                      <input type="text" [(ngModel)]="addressForm.addressLine" name="addrLine" required>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>City</label>
                        <input type="text" [(ngModel)]="addressForm.city" name="addrCity" required>
                      </div>
                      <div class="form-group">
                        <label>State</label>
                        <input type="text" [(ngModel)]="addressForm.state" name="addrState" required>
                      </div>
                      <div class="form-group">
                        <label>Pincode</label>
                        <input type="text" [(ngModel)]="addressForm.pincode" name="addrPincode" required>
                      </div>
                    </div>
                    <div class="form-group checkbox">
                      <label>
                        <input type="checkbox" [(ngModel)]="addressForm.isDefault" name="isDefault">
                        Set as default address
                      </label>
                    </div>
                    <div class="form-actions">
                      <button type="button" class="btn-secondary" (click)="cancelAddressForm()">Cancel</button>
                      <button type="submit" class="btn-primary">Save Address</button>
                    </div>
                  </form>
                </div>
              </div>
            </section>

            <!-- Change Password Section -->
            <section *ngIf="activeTab === 'password'" class="section-card">
              <h2>Change Password</h2>
              <form (ngSubmit)="changePassword()" #passwordForm="ngForm">
                <div class="form-group">
                  <label>Current Password</label>
                  <input type="password" [(ngModel)]="passwordData.current" name="currentPwd" required>
                </div>
                <div class="form-group">
                  <label>New Password</label>
                  <input type="password" [(ngModel)]="passwordData.new" name="newPwd" required>
                </div>
                <div class="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" [(ngModel)]="passwordData.confirm" name="confirmPwd" required>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn-primary">Update Password</button>
                </div>
              </form>
            </section>

            <!-- Placeholder for My Orders / Wishlist (can be separate pages) -->
            <section *ngIf="activeTab === 'orders'">
              <p class="info-message">Redirecting to My Orders page...</p>
            </section>
            <section *ngIf="activeTab === 'wishlist'">
              <p class="info-message">Redirecting to Wishlist page...</p>
            </section>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      background: var(--color-page-bg, #F9F7F5);
      min-height: 80vh;
      padding: 2rem 0;
    }

    .breadcrumb {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 2rem;
      color: var(--color-text-secondary, #666);
    }
    .breadcrumb a {
      text-decoration: none;
      color: inherit;
    }
    .breadcrumb .current {
      color: var(--color-primary, #1B3A5C);
      font-weight: bold;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 2rem;
    }

    /* Sidebar */
    .profile-sidebar ul {
      list-style: none;
      padding: 0;
      margin: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
      overflow: hidden;
    }
    .profile-sidebar li {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .profile-sidebar li:hover {
      background: #f5f2ef;
    }
    .profile-sidebar li.active {
      background: var(--color-primary, #1B3A5C);
      color: white;
    }

    /* Main Content */
    .section-card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    }
    .section-card h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.75rem;
      margin-bottom: 1.5rem;
      color: var(--color-primary, #1B3A5C);
    }

    /* Forms */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: var(--color-text-primary, #1A1A1A);
    }
    .form-group input, .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: 'DM Sans', sans-serif;
    }
    .radio-group {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .radio-group label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: normal;
    }
    .checkbox {
      display: flex;
      align-items: center;
    }
    .checkbox label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: normal;
    }
    .form-actions {
      margin-top: 1.5rem;
      display: flex;
      justify-content: flex-end;
    }
    .btn-primary, .btn-secondary, .btn-outline {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: var(--color-accent, #B8860B);
      border: none;
      color: white;
    }
    .btn-primary:hover {
      background: #9a6e08;
    }
    .btn-secondary {
      background: transparent;
      border: 1px solid var(--color-primary, #1B3A5C);
      color: var(--color-primary, #1B3A5C);
    }
    .btn-secondary:hover {
      background: var(--color-primary, #1B3A5C);
      color: white;
    }
    .btn-outline {
      background: transparent;
      border: 1px solid var(--color-accent, #B8860B);
      color: var(--color-accent, #B8860B);
    }
    .btn-outline:hover {
      background: var(--color-accent, #B8860B);
      color: white;
    }

    /* Address Book */
    .address-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .address-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .address-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      transition: all 0.2s;
    }
    .address-card.default {
      border-color: var(--color-accent, #B8860B);
      background: #fffaf0;
    }
    .address-info .name {
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    .address-info .phone {
      color: var(--color-text-secondary, #666);
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    .address-info .address {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    .default-badge {
      background: var(--color-accent, #B8860B);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 20px;
      font-size: 0.7rem;
      display: inline-block;
    }
    .address-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .icon-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.25rem;
    }
    .icon-btn.trash:hover {
      color: #c0392b;
    }
    .link-btn {
      background: none;
      border: none;
      color: var(--color-accent, #B8860B);
      cursor: pointer;
      font-size: 0.75rem;
      text-decoration: underline;
    }

    /* Modal */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .info-message {
      text-align: center;
      color: var(--color-text-secondary);
      padding: 3rem;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
      .profile-sidebar ul {
        display: flex;
        overflow-x: auto;
        white-space: nowrap;
      }
      .profile-sidebar li {
        display: inline-block;
        border-bottom: none;
        border-right: 1px solid #eee;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
      .address-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      .address-card {
        flex-direction: column;
      }
      .address-actions {
        margin-top: 1rem;
        justify-content: flex-end;
      }
    }
  `]
})
export class ProfileComponent {
  activeTab = 'profile';

  user = {
    name: 'Mallubhotla Srilakshmi',
    email: 'srilakshmi@example.com',
    phone: '+91 98765 43210',
    dob: '1990-01-01',
    gender: 'female'
  };

  addresses = signal<Address[]>([
    { id: 1, name: 'Mallubhotla Srilakshmi', phone: '+91 98765 43210', pincode: '400001', addressLine: '123, Jewellery Lane, Gold Bazaar', city: 'Mumbai', state: 'Maharashtra', isDefault: true },
    { id: 2, name: 'Mallubhotla Srilakshmi', phone: '+91 98765 43210', pincode: '560001', addressLine: '456, MG Road', city: 'Bengaluru', state: 'Karnataka', isDefault: false }
  ]);

  showAddressForm = false;
  editingAddress: Address | null = null;
  addressForm: any = {
    name: '', phone: '', pincode: '', addressLine: '', city: '', state: '', isDefault: false
  };

  passwordData = {
    current: '',
    new: '',
    confirm: ''
  };

  setActiveTab(tab: string) {
    this.activeTab = tab;
    // In a real app, you might navigate to different routes for orders/wishlist
    if (tab === 'orders') {
      // router.navigate(['/my-orders']);
    } else if (tab === 'wishlist') {
      // router.navigate(['/wishlist']);
    }
  }

  updateProfile() {
    // Mock API call
    alert('Profile updated successfully!');
  }

  editAddress(addr: Address) {
    this.editingAddress = addr;
    this.addressForm = { ...addr };
    this.showAddressForm = true;
  }

  saveAddress() {
    if (this.editingAddress) {
      // update existing
      const index = this.addresses().findIndex(a => a.id === this.editingAddress!.id);
      const updated = [...this.addresses()];
      updated[index] = { ...this.addressForm, id: this.editingAddress.id };
      this.addresses.set(updated);
    } else {
      // add new
      const newId = Math.max(...this.addresses().map(a => a.id), 0) + 1;
      this.addresses.set([...this.addresses(), { ...this.addressForm, id: newId }]);
    }
    if (this.addressForm.isDefault) {
      this.setDefault(this.addressForm.id || this.editingAddress!.id);
    }
    this.cancelAddressForm();
  }

  deleteAddress(id: number) {
    this.addresses.set(this.addresses().filter(a => a.id !== id));
  }

  setDefault(id: number) {
    const updated = this.addresses().map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    this.addresses.set(updated);
  }

  cancelAddressForm() {
    this.showAddressForm = false;
    this.editingAddress = null;
    this.addressForm = { name: '', phone: '', pincode: '', addressLine: '', city: '', state: '', isDefault: false };
  }

  changePassword() {
    if (this.passwordData.new !== this.passwordData.confirm) {
      alert('New passwords do not match');
      return;
    }
    // Mock API call
    alert('Password changed successfully!');
    this.passwordData = { current: '', new: '', confirm: '' };
  }
}