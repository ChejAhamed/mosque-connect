import { NextResponse } from 'next/server';
import axios from 'axios';

// Prayer times API endpoint
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters for prayer times (latitude, longitude, method, month, year)
    const latitude = searchParams.get('latitude') || '40.7128'; // Default to New York
    const longitude = searchParams.get('longitude') || '-74.0060';
    const method = searchParams.get('method') || '2'; // ISNA method
    const month = searchParams.get('month') || new Date().getMonth() + 1;
    const year = searchParams.get('year') || new Date().getFullYear();

    // Use Aladhan API for prayer times
    const apiUrl = `http://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}`;

    // Make request to prayer times API
    const response = await axios.get(apiUrl);

    // If API call is successful
    if (response.status === 200) {
      return NextResponse.json({
        success: true,
        data: response.data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch prayer times from external API'
      },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch prayer times'
      },
      { status: 500 }
    );
  }
}
