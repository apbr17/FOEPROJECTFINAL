import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import ReviewsPage from "./pages/ReviewsPage";
import BookingsPage from "./pages/BookingsPage";
import AccountPage from "./pages/AccountPage";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<Index />} />
          <Route path="/signin"   element={<SignIn />} />
          <Route path="/reviews"  element={<ReviewsPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/account"  element={<AccountPage />} />
          <Route path="*"         element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
