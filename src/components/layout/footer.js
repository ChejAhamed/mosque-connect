import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-green-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">MosqueConnect</h3>
            <p className="text-green-100 text-sm">
              Connecting mosques, volunteers, and businesses in the Muslim community.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-green-100 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/mosques" className="text-green-100 hover:text-white">
                  Mosque Directory
                </Link>
              </li>
              <li>
                <Link href="/volunteers" className="text-green-100 hover:text-white">
                  Volunteer
                </Link>
              </li>
              <li>
                <Link href="/businesses" className="text-green-100 hover:text-white">
                  Halal Businesses
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-green-100 hover:text-white">
                  Events
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Join Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register" className="text-green-100 hover:text-white">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-green-100 hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register?role=imam" className="text-green-100 hover:text-white">
                  Register as Imam
                </Link>
              </li>
              <li>
                <Link href="/register?role=business" className="text-green-100 hover:text-white">
                  Register Business
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-green-100">
                Email: info@mosqueconnect.com
              </li>
              <li className="text-green-100">
                Phone: +44 1234 567890
              </li>
              <li className="text-green-100">
                Address: London, United Kingdom
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-green-800 text-center text-sm text-green-100">
          <p>&copy; {currentYear} MosqueConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
