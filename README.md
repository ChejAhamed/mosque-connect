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

## Available User Roles

- **Community Member**: Regular users who can browse mosques, events, and volunteer
- **Imam**: Mosque administrators who can manage mosque details and needs
- **Business**: Business owners who can post announcements and products
- **Admin**: Full access to all features and user management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
