
import {Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import {ClerkProvider} from "@clerk/nextjs";
import { Toaster } from "sonner";
const inter=Inter({subsets:["latin"]});


export const metadata = {
  title: "ai finance platform",
  description: "One stop finance platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${inter.className}`}>
        {/* header */}
        <Header/>
        {/* helps search to know our main component */}
        <main className="min-h-screen">{children}</main>
        <Toaster/>
        {/* footer */}
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>Kim taehyung</p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
