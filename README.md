# MosqueConnect

MosqueConnect is a comprehensive platform designed to connect Muslims with their local communities. It provides a directory of mosques, Islamic events, halal businesses, and resources for the Muslim community.

## Features

- **Mosque Directory**: Find local mosques, prayer times, and community events
- **Islamic Events**: Stay updated on lectures, classes, fundraisers, and gatherings
- **Halal Businesses**: Discover and support local halal-certified businesses
- **Hadith Collection**: Access authentic hadiths with translations and explanations
- **User Authentication**: Register, login, and manage your profile
- **Role-based Access**: Special features for mosque administrators, business owners, and users

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **UI Components**: Custom components built on Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- MongoDB database connection

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mosque-connect.git
   cd mosque-connect
   ```

2. Install dependencies:
   ```bash
   bun install
   # or npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```env
   DATABASE_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret_key
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Run the development server:
   ```bash
   bun run dev
   # or npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

1. Push your repository to GitHub
2. Import your project to Vercel
3. Set environment variables in the Vercel dashboard
4. Deploy!

### Option 2: Other Hosting Providers

For other hosting providers, you'll need to build the application:

```bash
bun run build
bun start
```

See the [DEPLOYMENT.md](DEPLOYMENT.md) file for more detailed instructions.

## Environment Variables

The application requires the following environment variables:

- `DATABASE_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js authentication
- `NEXTAUTH_URL`: Full URL of your site (in production)
- `GOOGLE_MAPS_API_KEY`: Google Maps API key (if using maps features)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
