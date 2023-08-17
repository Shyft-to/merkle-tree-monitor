import Footer from "@/components/footer"
import Header from "@/components/header"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container mx-auto min-h-screen bg-[radial-gradient(#1e0c36_8%,#000_75%)] px-4 py-16 md:px-6">
        {children}
      </main>
      <Footer />
    </>
  )
}
