import { AuthCallback } from "@/components/auth/AuthCallback";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function CallbackPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <AuthCallback />
      </main>
      <Footer />
    </div>
  );
}
