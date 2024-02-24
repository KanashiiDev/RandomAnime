import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";

// layouts and pages
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Spinwheel from "./pages/spinwheel";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import "./pages/App.css";

// router and routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path='spinwheel' element={<Spinwheel />} />
      <Route path='about' element={<About />} />
      <Route path='*' element={<NotFound />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
