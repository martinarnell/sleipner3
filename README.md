# Sleipner3 - Model Routing SaaS

A Next.js SaaS application for intelligent model routing with cost optimization. This infrastructure provides user authentication, API key management, and protected endpoints.

## Features

- **User Authentication**: Secure signup/signin with Supabase Auth
- **API Key Management**: Generate and manage secure API keys
- **Protected Endpoints**: API key-authenticated endpoints for service access
- **Simple Dashboard**: Clean UI for managing API keys and account info
- **Row Level Security**: Database-level security with Supabase RLS

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS

## Setup Instructions

### 1. Database Setup

First, run the SQL commands in `database.sql` in your Supabase SQL editor to create the necessary tables and policies:

```sql
-- This will create the api_keys table with proper RLS policies
-- See database.sql for the complete schema
```

### 2. Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=your_bucket_name
JWT_SECRET=your_jwt_secret_for_api_tokens
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## API Documentation

### Authentication Endpoints

#### Sign Up
- **URL**: `/` (main page)
- **Method**: Web interface
- **Description**: Create a new user account

#### Sign In
- **URL**: `/` (main page)
- **Method**: Web interface
- **Description**: Sign in to existing account

### Dashboard

#### Dashboard
- **URL**: `/dashboard`
- **Method**: GET (web interface)
- **Description**: Manage API keys and view account information
- **Authentication**: Required (session-based)

### API Key Management

#### Create API Key
- **URL**: `/api/keys`
- **Method**: POST
- **Authentication**: Required (session-based)
- **Body**:
  ```json
  {
    "name": "My API Key"
  }
  ```
- **Response**:
  ```json
  {
    "key": "sk_1234567890abcdef...",
    "id": "uuid"
  }
  ```

#### List API Keys
- **URL**: `/api/keys`
- **Method**: GET
- **Authentication**: Required (session-based)
- **Response**:
  ```json
  {
    "keys": [
      {
        "id": "uuid",
        "name": "My API Key",
        "key_prefix": "sk_1234567890...",
        "created_at": "2024-01-01T00:00:00Z",
        "last_used_at": null,
        "is_active": true
      }
    ]
  }
  ```

#### Delete API Key
- **URL**: `/api/keys/{id}`
- **Method**: DELETE
- **Authentication**: Required (session-based)
- **Response**:
  ```json
  {
    "success": true
  }
  ```

### Protected Endpoints (API Key Authentication)

#### Get User Information
- **URL**: `/api/user/me`
- **Method**: GET
- **Authentication**: Required (API key)
- **Headers**:
  ```
  Authorization: Bearer sk_your_api_key_here
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "api_key": {
      "id": "uuid",
      "name": "My API Key"
    }
  }
  ```

## Usage Examples

### Using the API Key

Once you have created an API key through the dashboard, you can use it to access protected endpoints:

```bash
# Get user information
curl -H "Authorization: Bearer sk_your_api_key_here" \
  http://localhost:3000/api/user/me
```

```javascript
// JavaScript example
const response = await fetch('/api/user/me', {
  headers: {
    'Authorization': 'Bearer sk_your_api_key_here'
  }
});

const data = await response.json();
console.log(data);
```

### API Key Format

API keys follow this format:
- Prefix: `sk_`
- Length: 67 characters total
- Example: `sk_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

## Security Features

- **Row Level Security**: Database policies ensure users can only access their own data
- **API Key Hashing**: Keys are hashed before storage (SHA-256)
- **Session Management**: Secure session handling with Supabase Auth
- **Protected Routes**: Middleware protects authenticated routes
- **Input Validation**: Server-side validation for all inputs

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── keys/          # API key management endpoints
│   │   └── user/          # User information endpoints
│   ├── auth/
│   │   └── callback/      # Auth callback handler
│   ├── dashboard/         # Dashboard page
│   └── page.tsx           # Home page (auth form)
├── components/
│   ├── AuthForm.tsx       # Authentication form
│   └── Dashboard.tsx      # Dashboard component
└── lib/
    ├── api-keys.ts        # API key utilities
    └── supabase/          # Supabase client configuration
```

### Building for Production

```bash
npm run build
npm start
```

## Next Steps

This infrastructure provides the foundation for:
- Model routing logic
- Usage tracking and billing
- Rate limiting
- Model performance monitoring
- Advanced dashboard features

The current implementation focuses on core authentication and API key management, providing a solid base for expanding into the full model routing service.