"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  MessageCircle,
  Sparkles,
  Store,
  Compass
} from "lucide-react";

interface ContactSettings {
  pageTitle: string;
  pageSubtitle: string;
  primaryEmail: string;
  secondaryEmail: string;
  primaryPhone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  pincode: string;
  workingHoursWeekdays: string;
  workingHoursWeekends: string;
  mapEmbedUrl: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
}

const defaultContact: ContactSettings = {
  pageTitle: "Get in Touch with Vardayini Sweet Mart",
  pageSubtitle: "Have questions about our pure ghee sweets, bulk corporate gifting, or order status? We're here to help!",
  primaryEmail: "support@vardayinisweets.com",
  secondaryEmail: "orders@vardayinisweets.com",
  primaryPhone: "+91 98765 43210",
  secondaryPhone: "+91 0261 2345678",
  whatsappNumber: "+91 98765 43210",
  address: "123 Ring Road, Near Textile Market",
  city: "Surat, Gujarat",
  pincode: "395002",
  workingHoursWeekdays: "8:00 AM - 10:00 PM (Mon - Sat)",
  workingHoursWeekends: "8:00 AM - 10:30 PM (Sun)",
  mapEmbedUrl: "https://maps.google.com/maps?q=Surat%20Textile%20Market&t=&z=14&ie=UTF8&iwloc=&output=embed",
};

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactSettings>(defaultContact);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_contact_settings");
      if (stored) {
        try {
          setContactInfo(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, []);

  function handleSubmitMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;

    const newInquiry = {
      id: `inq-${Date.now()}`,
      name,
      email,
      phone,
      subject: subject || "General Inquiry",
      message,
      date: new Date().toLocaleString(),
      status: "Pending",
    };

    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("admin_contact_inquiries");
      let list = [];
      if (existing) {
        try {
          list = JSON.parse(existing);
        } catch (e) {}
      }
      list.unshift(newInquiry);
      localStorage.setItem("admin_contact_inquiries", JSON.stringify(list));
    }

    setSubmitted(true);
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
    setTimeout(() => setSubmitted(false), 5000);
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <Header />

      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-gold/20 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 max-w-7xl mx-auto">
          <Link href="/" className="hover:text-gold-dark transition font-medium">Home</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="font-bold text-[#0B1B3D]">Contact Us</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1B3D] via-[#162C5B] to-[#0A1836] p-6 sm:p-10 text-white shadow-xl border-2 border-gold/30">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider border border-gold/40">
              <PhoneCall size={14} />
              <span>Customer Care & Support</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {contactInfo.pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {contactInfo.pageSubtitle}
            </p>
          </div>
        </div>

        {/* 4 Contact Quick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Phone */}
          <div className="bg-white p-5 rounded-2xl border-2 border-gold/20 shadow-sm hover:border-gold/60 transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold-dark flex items-center justify-center font-bold">
              <PhoneCall size={20} />
            </div>
            <h3 className="text-sm font-black text-[#0B1B3D]">Call Us Directly</h3>
            <p className="text-xs text-gray-600 font-bold">{contactInfo.primaryPhone}</p>
            {contactInfo.secondaryPhone && (
              <p className="text-[11px] text-gray-500 font-medium">{contactInfo.secondaryPhone}</p>
            )}
          </div>

          {/* Card 2: Email */}
          <div className="bg-white p-5 rounded-2xl border-2 border-gold/20 shadow-sm hover:border-gold/60 transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold-dark flex items-center justify-center font-bold">
              <Mail size={20} />
            </div>
            <h3 className="text-sm font-black text-[#0B1B3D]">Email Support</h3>
            <p className="text-xs text-gray-600 font-bold">{contactInfo.primaryEmail}</p>
            {contactInfo.secondaryEmail && (
              <p className="text-[11px] text-gray-500 font-medium">{contactInfo.secondaryEmail}</p>
            )}
          </div>

          {/* Card 3: WhatsApp */}
          <div className="bg-white p-5 rounded-2xl border-2 border-gold/20 shadow-sm hover:border-gold/60 transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
              <MessageCircle size={20} />
            </div>
            <h3 className="text-sm font-black text-[#0B1B3D]">WhatsApp Support</h3>
            <p className="text-xs text-green-700 font-bold">{contactInfo.whatsappNumber}</p>
            <a
              href={`https://wa.me/${contactInfo.whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-green-800 font-extrabold hover:underline block"
            >
              Chat on WhatsApp ↗
            </a>
          </div>

          {/* Card 4: Operating Hours */}
          <div className="bg-white p-5 rounded-2xl border-2 border-gold/20 shadow-sm hover:border-gold/60 transition space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold-dark flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <h3 className="text-sm font-black text-[#0B1B3D]">Working Hours</h3>
            <p className="text-xs text-gray-600 font-medium">{contactInfo.workingHoursWeekdays}</p>
            <p className="text-[11px] text-gray-500 font-medium">{contactInfo.workingHoursWeekends}</p>
          </div>
        </div>

        {/* Main Grid: Form + Address Map View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border-2 border-gold/30 shadow-lg space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gold-dark tracking-wider block">Send Message</span>
              <h2 className="text-xl font-extrabold text-[#0B1B3D]">Send Us a Message</h2>
              <p className="text-xs text-gray-600">Fill out the form below and our customer team will respond shortly.</p>
            </div>

            {submitted && (
              <div className="p-4 bg-green-100 border border-green-300 text-green-900 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow">
                <CheckCircle2 size={18} className="text-green-700 shrink-0" />
                <span>Thank you! Your message has been submitted. Our team will contact you soon.</span>
              </div>
            )}

            <form onSubmit={handleSubmitMessage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Prajapati"
                    className="w-full border border-gray-300 p-3 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full border border-gray-300 p-3 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full border border-gray-300 p-3 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Order status / Corporate Gifting"
                    className="w-full border border-gray-300 p-3 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full border border-gray-300 p-3 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0B1B3D] text-gold hover:bg-[#162C5B] font-black py-3.5 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow border border-gold/40"
              >
                <Send size={16} />
                <span>Submit Message</span>
              </button>
            </form>
          </div>

          {/* Location & Stores (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border-2 border-gold/30 shadow-lg space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gold-dark tracking-wider block">Headquarters</span>
              <h2 className="text-xl font-extrabold text-[#0B1B3D]">Visit Our Main Store</h2>
              <p className="text-xs text-gray-600">
                {contactInfo.address}, {contactInfo.city} - {contactInfo.pincode}
              </p>
            </div>

            {/* Map Frame */}
            <div className="h-64 rounded-2xl overflow-hidden border border-gold/30 shadow-inner bg-slate-900">
              <iframe
                title="Head Office Location Map"
                width="100%"
                height="100%"
                className="w-full h-full border-0"
                loading="lazy"
                src={contactInfo.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(contactInfo.address + ' ' + contactInfo.city)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              />
            </div>

            {/* Link to Store Locator */}
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#0B1B3D]">Looking for Store Outlets?</h4>
                <p className="text-[11px] text-gray-600">Locate all our physical branches near you.</p>
              </div>

              <Link
                href="/stores"
                className="bg-gold text-[#0B1B3D] hover:bg-gold-light px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition flex items-center gap-1 shadow"
              >
                <Store size={14} />
                <span>Store Directory</span>
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
