import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";

// layouts and pages
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Spinwheel from "./pages/spinwheel";
import NotFound from "./pages/NotFound";
import "./pages/App.css";
import Watchlist from "./pages/Watchlist";

// router and routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path='spinwheel' element={<Spinwheel />} />
      <Route path='watchlist' element={<Watchlist />} />
      <Route path='*' element={<NotFound />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
