import { Outlet } from "react-router-dom"
import Navbar from "../components/navbar"
import Footer from "../components/Footer"

export default function RootLayout() {
  return (
    <div>
      <Navbar/>
      <Outlet />
      <Footer/>
    </div>
  )
}
