"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/muslim-connect-logo.svg"
                alt="Mosque Connect"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="text-xl font-semibold">MosqueConnect</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="font-medium">
                Home
              </Link>
              <Link href="/mosques" className="font-medium">
                Mosques
              </Link>
              <Link href="/events" className="font-medium">
                Events
              </Link>
              <Link href="/businesses" className="font-medium">
                Businesses
              </Link>
              <Link href="/hadith" className="font-medium">
                Hadith
              </Link>
            </nav>
            <div className="hidden md:flex space-x-4">
              <Link href="/login">
                <button className="px-4 py-2 rounded border border-gray-300 text-gray-700">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 rounded bg-green-600 text-white">
                  Register
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-green-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Connecting Muslims with their Local Community
            </h1>
            <p className="text-xl max-w-2xl mx-auto mb-10">
              Find mosques, events, businesses, and connect with community
              members near you.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register">
                <button className="px-6 py-3 rounded bg-green-600 text-white font-medium">
                  Join the Community
                </button>
              </Link>
              <Link href="/mosques">
                <button className="px-6 py-3 rounded border border-green-600 text-green-600 font-medium">
                  Find a Mosque
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Our Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">🕌</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Mosque Directory</h3>
                <p className="text-gray-600">
                  Find local mosques, prayer times, and community events in your
                  area.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">🗓️</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Islamic Events</h3>
                <p className="text-gray-600">
                  Stay updated on lectures, classes, fundraisers, and community
                  gatherings.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">🏪</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Muslim Businesses
                </h3>
                <p className="text-gray-600">
                  Support local halal businesses and services in your community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-green-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Join the MosqueConnect Community Today
            </h2>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Connect with your local Muslim community, find resources, and
              contribute to a thriving ummah.
            </p>
            <Link href="/register">
              <button className="px-8 py-3 rounded bg-white text-green-600 font-medium">
                Create Your Account
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">MosqueConnect</h3>
              <p className="text-gray-400">
                Connecting Muslims with their local community resources and
                services.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/mosques" className="text-gray-400 hover:text-white">
                    Mosques
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-gray-400 hover:text-white">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/businesses" className="text-gray-400 hover:text-white">
                    Businesses
                  </Link>
                </li>
                <li>
                  <Link href="/hadith" className="text-gray-400 hover:text-white">
                    Hadith
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  Facebook
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© {new Date().getFullYear()} MosqueConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
