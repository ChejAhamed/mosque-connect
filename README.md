# MosqueConnect

MosqueConnect is a platform connecting mosques with community members, businesses, and volunteers. This application helps facilitate services, events, and volunteering opportunities within the Islamic community.

## Features

- User roles (Community Member, Imam, Business, Admin)
- Mosque directory with interactive map
- Prayer times
- Volunteer registration and management
- Business directory and announcements
- Event management
- User profiles with role-based access

## Getting Started

### Prerequisites

- Node.js 18+
- Bun package manager
- MongoDB instance (local or remote)

### Installation

1. Clone the repository
```bash
git clone https://github.com/ChejAhamed/mosque-connect.git
cd mosque-connect
```

2. Install dependencies
```bash
bun install
```

3. Set up environment variables
Copy the `.env.example` file to `.env.local` and fill in the required values:
```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: Base URL of your application

### Running the Application

1. Start the development server
```bash
bun run dev
```

2. Seed the database with mosque data (optional but recommended)
```bash
bun run seed:mosques
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Map Functionality

The mosque directory includes an interactive map implemented with Google Maps API. The map displays mosque locations and allows users to:

- View all mosque locations at once
- Click on markers to see mosque details
- Open mosque detail pages from info windows

## Deployment

This application is configured for deployment on Vercel. See `VERCEL_SETUP.md` for detailed deployment instructions.

## Authentication

- NextAuth.js for authentication
- Role-based access control
- Demo login available for testing

## NextAuth Configuration

### Environment Variables

The application uses NextAuth.js for authentication, which requires proper configuration of environment variables. The most important one is `NEXTAUTH_URL`, which must be set correctly for each environment:

#### Local Development

For local development, set in `.env.local`:

```
NEXTAUTH_URL=http://localhost:3000
```

#### Production Deployment

For production deployment on Vercel or similar platforms, set in the environment variables section:

```
NEXTAUTH_URL=https://your-production-domain.com
```

If your application is hosted on Vercel, the `NEXTAUTH_URL` will automatically be set to the deployment URL. However, it's still recommended to manually set it to ensure proper callback handling.

#### Other Required Variables

Make sure you also have these variables configured:

```
# NextAuth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-secure-random-string

# Database connection
DATABASE_URI=your-mongodb-connection-string

# Other API keys as required
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

You can create a `.env.local` file in the root of your project with these variables for local development, and add them to your deployment platform's environment variables for production.

## Available User Roles

- **Community Member**: Regular users who can browse mosques, events, and volunteer
- **Imam**: Mosque administrators who can manage mosque details and needs
- **Business**: Business owners who can post announcements and products
- **Admin**: Full access to all features and user management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
