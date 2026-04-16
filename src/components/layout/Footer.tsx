// components/layout/Footer.tsx
import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-20 pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-200 via-white to-pink-200" />
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-2xl font-heading font-bold tracking-[0.25em] text-white">GK STUDIO</span>
              <span className="text-[10px] tracking-[0.3em] text-pink-200 uppercase -mt-1">Jewellery & Footwear</span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">
              GK Studio is your one-stop destination for premium imitation jewellery and orthopedic footwear. We combine traditional craftsmanship with modern comfort.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-white/10 hover:bg-pink-400 transition-colors rounded-full hover:scale-110 transform duration-300">
                  <Icon size={18} className="text-pink-200" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading text-xl font-bold mb-6 text-white tracking-wide">Shop By Category</h4>
            <ul className="space-y-3 text-sm text-gray-200">
              {['Necklaces', 'Earrings', 'Bangles & Bracelets', 'Accessories', '92.5 Silver Collection', 'Ortho Footwear'].map(cat => (
                <li key={cat}><Link to={`/category/${cat.toLowerCase().replace(/\s/g, '-')}`} className="hover:text-pink-200 transition-colors">{cat}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-xl font-bold mb-6 text-white tracking-wide">Customer Service</h4>
            <ul className="space-y-3 text-sm text-gray-200">
              {['Track Your Order', 'Shipping & Delivery', 'Returns & Exchanges', 'FAQs', 'Store Locator', 'Contact Us'].map(item => (
                <li key={item}><Link to="#" className="hover:text-pink-200 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-xl font-bold mb-6 text-white tracking-wide">Get In Touch</h4>
            <ul className="space-y-4 text-sm text-gray-200">
              <li className="flex items-start gap-3"><MapPin size={20} className="text-pink-200 shrink-0" /><span>123, Jewellery Lane, Gold Bazaar, Mumbai - 400001</span></li>
              <li className="flex items-center gap-3"><Phone size={20} className="text-pink-200 shrink-0" /><span>+91 98765 43210</span></li>
              <li className="flex items-center gap-3"><Mail size={20} className="text-pink-200 shrink-0" /><span>support@gkstudio.com</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-gray-200 uppercase tracking-widest">
          <p>© 2026 GK Studio. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-pink-200 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-pink-200 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;