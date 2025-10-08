import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import StatusClient from "./status-client"

export { metadata } from "./metadata"
export { viewport } from "./viewport"

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <StatusClient />
      </main>
      <Footer />
    </div>
  )
}