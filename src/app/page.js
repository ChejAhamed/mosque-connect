import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-green-50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-green-800 mb-6">
            Connect Your Muslim Community
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            MosqueConnect brings together mosques, volunteers, and businesses to strengthen our ummah. Find local mosques, volunteer your skills, or promote your halal business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/mosques">
              <Button size="lg" className="w-full sm:w-auto">
                Find a Mosque
              </Button>
            </Link>
            <Link href="/volunteers">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Volunteer Now
              </Button>
            </Link>
            <Link href="/businesses">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Halal Businesses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Prayer Times Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Live Prayer Times
          </h2>
          <div className="max-w-3xl mx-auto bg-green-50 p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-medium">London, UK</div>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-3 rounded shadow-sm text-center">
                <div className="text-sm text-gray-500">Fajr</div>
                <div className="font-semibold">5:15 AM</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm text-center">
                <div className="text-sm text-gray-500">Dhuhr</div>
                <div className="font-semibold">12:30 PM</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm text-center">
                <div className="text-sm text-gray-500">Asr</div>
                <div className="font-semibold">3:45 PM</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm text-center">
                <div className="text-sm text-gray-500">Maghrib</div>
                <div className="font-semibold">6:58 PM</div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm text-center">
                <div className="text-sm text-gray-500">Isha</div>
                <div className="font-semibold">8:30 PM</div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              * Prayer times are approximate. Please check with your local mosque for exact timings.
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mosques */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Featured Mosques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((mosque) => (
              <div key={mosque} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">
                    East London Mosque
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    London E1, United Kingdom
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">Skills needed: Teaching, IT</div>
                    <Link href={`/mosques/${mosque}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/mosques">
              <Button variant="outline">View All Mosques</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Halal Certified Businesses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((business) => (
              <div key={business} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-md">
                      Halal Kitchen
                    </h3>
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      Verified
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs mb-3">
                    Restaurant • London
                  </p>
                  <Link href={`/businesses/${business}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/businesses">
              <Button variant="outline">View All Businesses</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            How MosqueConnect Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">For Mosques</h3>
              <p className="text-gray-600 text-sm">
                Register your mosque, list your volunteer needs, manage events, and connect with volunteers and businesses in your community.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">For Volunteers</h3>
              <p className="text-gray-600 text-sm">
                Register your skills, select your availability, and get matched with mosques that need your help. Make a difference in your community.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">For Businesses</h3>
              <p className="text-gray-600 text-sm">
                Register your business, upload your halal certificates for verification, and get visibility in the Muslim community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-green-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Join Our Growing Community
          </h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Whether you're a mosque administrator, volunteer, or business owner, MosqueConnect has something for you. Register today and be part of our community.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-green-900 hover:bg-green-100">
              Register Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
