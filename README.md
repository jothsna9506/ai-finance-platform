# Wealth – AI-Powered Finance & Budget Management App

Overview
Wealth is a full-stack, AI-integrated finance management application that empowers users to track their income, expenses, and budgets across multiple accounts. It leverages modern technologies and tools like Gemini AI for receipt scanning, Supabase and Prisma for scalable backend, and Inngest for background automation. The platform provides smart budget alerts, recurring transactions, interactive visualizations, and secure authentication.

Features

 Core Functionality
- AI-powered receipt scanning using Gemini AI to extract transaction details like amount, date, and category.
- Multi-account finance tracking for income, expenses, and budgets.
- Smart budgeting with threshold alerts and visual analytics.
- Recurring transactions handled by background jobs via Inngest.
- Monthly AI-generated financial reports sent via email.

 Visual Insights
- Interactive charts built with Recharts to show category-wise spending, income vs expenses, and trends over time.

 Authentication and Security
- Secure authentication using Clerk for login, signup, session management, and route protection.
- API protection using Arcjet for rate limiting and bot detection.

#Tech Stack

Frontend:
- Next.js 13 (App Router)
- Tailwind CSS
- ShadCN UI
- React Hook Form + Zod
- Recharts
- React Email + Resend API

Backend:
- Supabase (PostgreSQL, Auth, Storage)
- Prisma ORM
- Inngest for background jobs
- Gemini AI for receipt parsing
- Arcjet for security



## Architecture Overview

- Modular folder structure for pages, components, actions, and API routes.
- Relational database design using Prisma schemas (Users, Accounts, Transactions, Budgets).
- Event-driven background processing via Inngest.
- Protected API routes with Arcjet rate-limiting.
- Personalized financial reports using React Email and Resend.

