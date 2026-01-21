# Badge Delivery Platform - API Documentation

## Overview

This document describes the API endpoints available in the Badge Delivery Platform.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.vercel.app`

## Authentication

Most endpoints require authentication via Supabase Auth. The user's session token is automatically included in requests when using the Supabase client.

---

## Endpoints

### 1. Create Badge

Create a new badge for a user.

**Endpoint**: `POST /api/badges`

**Authentication**: Service role (server-side only)

**Request Body**:
```json
{
  "user_email": "user@example.com",
  "badge_name": "Web Development Master",
  "badge_description": "Completed advanced web development course",
  "event_name": "Web Dev Bootcamp 2026",
  "badge_image_url": "https://storage-url.com/badge.png"
}
```

**Required Fields**:
- `user_email` (string): Email of the user receiving the badge
- `badge_name` (string): Name of the badge
- `event_name` (string): Name of the event/achievement

**Optional Fields**:
- `badge_description` (string): Description of the badge
- `badge_image_url` (string): URL to badge image in Supabase Storage

**Success Response** (200):
```json
{
  "success": true,
  "badge": {
    "id": "uuid",
    "user_id": "uuid",
    "badge_name": "Web Development Master",
    "badge_description": "Completed advanced web development course",
    "badge_image_url": "https://storage-url.com/badge.png",
    "event_name": "Web Dev Bootcamp 2026",
    "issued_date": "2026-01-21T12:00:00Z",
    "created_at": "2026-01-21T12:00:00Z"
  },
  "message": "Badge created successfully"
}
```

**Error Responses**:

400 - Missing required fields:
```json
{
  "error": "Missing required fields"
}
```

404 - User not found:
```json
{
  "error": "User not found"
}
```

500 - Server error:
```json
{
  "error": "Failed to create badge"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/badges \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "user@example.com",
    "badge_name": "Web Development Master",
    "badge_description": "Completed advanced web development course",
    "event_name": "Web Dev Bootcamp 2026"
  }'
```

---

### 2. Get User Badges

Retrieve all badges for a specific user.

**Endpoint**: `GET /api/badges?user_id={userId}`

**Authentication**: Service role (server-side only)

**Query Parameters**:
- `user_id` (required): UUID of the user

**Success Response** (200):
```json
{
  "badges": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "badge_name": "Web Development Master",
      "badge_description": "Completed advanced web development course",
      "badge_image_url": "https://storage-url.com/badge.png",
      "event_name": "Web Dev Bootcamp 2026",
      "issued_date": "2026-01-21T12:00:00Z",
      "created_at": "2026-01-21T12:00:00Z"
    }
  ]
}
```

**Error Responses**:

400 - Missing user ID:
```json
{
  "error": "User ID required"
}
```

500 - Server error:
```json
{
  "error": "Failed to fetch badges"
}
```

**Example cURL**:
```bash
curl -X GET "http://localhost:3000/api/badges?user_id=user-uuid-here"
```

---

### 3. Send Badge Email

Send an email notification to a user about their new badge.

**Endpoint**: `POST /api/send-badge-email`

**Authentication**: Service role (server-side only)

**Request Body**:
```json
{
  "to_email": "user@example.com",
  "badge_name": "Web Development Master",
  "event_name": "Web Dev Bootcamp 2026",
  "badge_link": "https://your-domain.com/dashboard"
}
```

**Required Fields**:
- `to_email` (string): Recipient email address
- `badge_name` (string): Name of the badge
- `event_name` (string): Name of the event

**Optional Fields**:
- `badge_link` (string): Custom link to badge (defaults to `/dashboard`)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Email sent successfully",
  "data": {
    "id": "email-id-from-resend"
  }
}
```

**Error Responses**:

400 - Missing required fields:
```json
{
  "error": "Missing required fields"
}
```

500 - Email send failure:
```json
{
  "error": "Failed to send email"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/send-badge-email \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "user@example.com",
    "badge_name": "Web Development Master",
    "event_name": "Web Dev Bootcamp 2026"
  }'
```

---

## Complete Workflow Example

### Scenario: Award a badge to a user and notify them

**Step 1**: Create the badge
```bash
curl -X POST http://localhost:3000/api/badges \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "john@example.com",
    "badge_name": "JavaScript Expert",
    "badge_description": "Mastered JavaScript fundamentals and advanced concepts",
    "event_name": "JS Bootcamp 2026",
    "badge_image_url": "https://your-storage.supabase.co/badge-images/js-expert.png"
  }'
```

**Step 2**: Send email notification
```bash
curl -X POST http://localhost:3000/api/send-badge-email \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "john@example.com",
    "badge_name": "JavaScript Expert",
    "event_name": "JS Bootcamp 2026"
  }'
```

**Step 3**: User receives email, clicks link, signs in, and sees badge in dashboard

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Rate Limiting

Currently, there are no rate limits implemented. For production use, consider:
- Implementing rate limiting middleware
- Using Vercel's built-in rate limiting
- Monitoring API usage in Vercel Analytics

---

## Security Considerations

1. **API Routes are public** - Implement authentication/authorization as needed
2. **Service Role Key** - Never expose in client-side code
3. **Input Validation** - Always validate and sanitize inputs
4. **RLS Policies** - Supabase RLS protects database access

---

## Testing

### Using Postman

1. Create a new request
2. Set method (POST/GET)
3. Enter endpoint URL
4. Add headers: `Content-Type: application/json`
5. Add request body (for POST requests)
6. Send request

### Using JavaScript/TypeScript

```typescript
// Create badge
const response = await fetch('/api/badges', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_email: 'user@example.com',
    badge_name: 'Test Badge',
    event_name: 'Test Event',
  }),
})

const data = await response.json()
console.log(data)
```

---

## Support

For API issues:
1. Check request format matches documentation
2. Verify environment variables are set
3. Check Vercel function logs
4. Review Supabase logs

---

**Last Updated**: January 2026
