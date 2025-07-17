import { Outlet } from "react-router-dom"
import Navbar from "../components/navbar"
import Footer from "../components/Footer"

export default function RootLayout() {
  return (
    <div className="root-layout">
      <Navbar />
      <main className="content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

