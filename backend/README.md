# Alcoa Aluminium Scaffolding — Backend

Lightweight Node.js/Express backend for handling contact and quote emails for the Alcoa Aluminium Scaffolding website.

This service accepts contact and quote requests from the frontend, validates and sanitizes the input, and dispatches emails using the Resend API (production) or the configured SMTP provider (if configured locally). It also includes rate limiting, logging, and basic security middleware.

## Table of contents

- Features
- Tech stack
- Prerequisites
- Installation
- Environment variables
- Run (development & production)
- API endpoints
- Rate limiting & security
- Project structure
- Contributing
- License

## Features

- Receive and validate contact form submissions
- Receive and validate quote requests
- Send notification emails to company and auto-reply to customers
- Resend API integration with retries and tagging
- Rate limiting per IP/email to prevent abuse
- Request logging, sanitization and basic security headers
- Development test endpoint to validate email configuration

## Tech stack

- Node.js
- Express
- Resend (npm package `resend`) for production email sending
- Nodemailer (if you add SMTP support locally)
- Middleware: helmet, cors, express-rate-limit
- dotenv for configuration

## Prerequisites

- Node.js v16+ (recommended)
- npm (or yarn)
- A Resend account and API key for production email sending (recommended)

## Installation

1. Clone this repository and change into the backend folder.
2. Install dependencies:

```powershell
npm install
```

## Environment variables

Create a `.env` file at the project root (or set environment variables via your host). Important variables used by this project:

- `PORT` — Port the server listens on (default: 5000)
- `NODE_ENV` — `development` or `production`
- `FRONTEND_URL` — Trusted frontend origin for CORS

Resend / email configuration:
- `RESEND_API_KEY` — (required in production) Resend API key used to send emails
- `RESEND_FROM_EMAIL` — Optional. From address used by Resend (default fallback provided in code)
- `COMPANY_EMAIL` — Company email address that receives submissions (fallbacks are used if not set)

Optional / additional config:
- `RESPONSE_TIME` — Human-facing response time (default in config)
- `EMERGENCY_HOTLINE` — Emergency phone
- `SUPPORT_EMAIL` — Support email override
- `COMPANY_NAME`, `COMPANY_ADDRESS`, `TIMEZONE`, `LOG_LEVEL` — Misc config

Note: The Resend service will throw an error at startup if `RESEND_API_KEY` is missing when the Resend service is required. For local development you can still test by setting a valid `RESEND_API_KEY` or by stubbing the service.

## Run

Start in development (auto-reload with nodemon):

```powershell
npm run dev
```

Start in production:

```powershell
npm start
```

The server's main file is `server.js` and the configured default port is `5000`.

## API Endpoints

All endpoints are prefixed with `/api`.

- POST /api/email/send-contact
	- Description: Accepts contact form submissions and sends two emails: one to the company and an auto-reply to the customer.
	- Request body (JSON):
		- `name` (string, required)
		- `email` (string, required)
		- `phone` (string, required)
		- `message` (string, required; min 10 characters)
		- `company` (string, optional)
		- `projectType` (string, optional)

- POST /api/email/send-quote
	- Description: Accepts quote requests and sends notification and auto-reply emails.
	- Request body (JSON):
		- `name` (string, required)
		- `email` (string, required)
		- `phone` (string, required)
		- `projectHeight` (number, optional)
		- `coverageArea` (number, optional)
		- `message` (string, optional; if present min 10 characters)
		- `company` (string, optional)
		- `projectType`, `duration`, `startDate` (optional)

- GET /api/email/test
	- Description: Test email configuration. Only available in `development` (protected to avoid accidental usage in production).

- GET /api/health
	- Description: Simple health check. Returns service status and whether email is configured.

Responses use standard HTTP status codes. Validation errors return `400` with a details object. Rate limiting returns `429`.

## Rate limiting & security

- Global API rate limiting is enabled (see `config/app.config.js`).
- Email endpoints have stricter rate limits and a custom key generator which combines IP and the email address submitted to reduce abuse.
- Security middleware includes `helmet` and a custom request sanitization middleware.

## Project structure (key files)

- `server.js` — Application entry point, middleware, route wiring and health endpoint
- `routes/email.routes.js` — Email HTTP routes
- `controllers/email.controller.js` — Request handlers for email endpoints
- `services/resend.service.js` — Production email sending logic (Resend API integration)
- `services/email.service.js` — Generic email service wrapper (if present)
- `config/app.config.js` — Central configuration
- `middleware/` — Rate limiting, security, logging and error handlers
- `utils/emailTemplates.js` — HTML templates used for emails
- `validators/email.validator.js` — Validation and sanitization for incoming requests

## Logging

The app uses a small logging utility located in `utils/logger.js`. Logging behaviour is configurable via `LOG_LEVEL` and `NODE_ENV`.

## Deployment notes

- Ensure `NODE_ENV=production` and `RESEND_API_KEY` are present in your environment for production email delivery.
- Validate `COMPANY_EMAIL` and `RESEND_FROM_EMAIL` match verified domains in Resend (or your SMTP provider) to avoid deliverability problems.
- Consider running behind a load balancer or reverse proxy; `app.set('trust proxy', 1)` is set to allow rate-limiter to work with proxied IPs.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Add tests for new behavior
4. Open a pull request describing your changes

If you update environment variables or add new endpoints, please also add short notes into this README.

## License

This project is provided under the MIT license (see `package.json`).

---

If you want, I can also add example `curl`/PowerShell requests for the API endpoints, or generate a small Postman collection. Which would you prefer? 

 