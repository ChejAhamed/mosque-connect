"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
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
    </div>
  );
}
