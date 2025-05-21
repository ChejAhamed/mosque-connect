'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MosqueDetail({ mosque }) {
  if (!mosque) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Mosque Not Found</h1>
        <p className="text-gray-600 mb-6">
          The mosque you are looking for doesn't exist or has been removed.
        </p>
        <Link href="/mosques">
          <Button>Return to Mosques Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{mosque.name}</h1>
          <Link href="/mosques">
            <Button variant="outline">Back to Mosques</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            {mosque.imageUrl ? (
              <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                <Image
                  src={mosque.imageUrl}
                  alt={mosque.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-[300px] w-full bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p className="text-sm text-gray-600">{mosque.address}</p>
                  <p className="text-sm text-gray-600">{mosque.city}, {mosque.state} {mosque.zipCode}</p>
                </div>

                {mosque.phone && (
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-sm text-gray-600">{mosque.phone}</p>
                  </div>
                )}

                {mosque.email && (
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-gray-600">{mosque.email}</p>
                  </div>
                )}

                {mosque.website && (
                  <div>
                    <h3 className="font-medium">Website</h3>
                    <a
                      href={mosque.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline"
                    >
                      {mosque.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {mosque.description || "No description available."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              {mosque.facilityFeatures && mosque.facilityFeatures.length > 0 ? (
                <ul className="grid grid-cols-2 gap-2">
                  {mosque.facilityFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No facilities information available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Prayer Times</CardTitle>
          </CardHeader>
          <CardContent>
            {mosque.prayerTimes && Object.keys(mosque.prayerTimes).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(mosque.prayerTimes).map(([prayer, time]) => (
                  <div key={prayer} className="text-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium capitalize">{prayer}</h3>
                    <p className="text-lg font-bold text-green-600">{time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-gray-600 mb-4">Prayer times are not available at the moment.</p>
                <Link href="/">
                  <Button variant="outline" size="sm">Check Prayer Times</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {mosque.imamName && (
          <Card>
            <CardHeader>
              <CardTitle>Imam Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium">
                    {mosque.imamName ? mosque.imamName.charAt(0) : 'I'}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">{mosque.imamName}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
