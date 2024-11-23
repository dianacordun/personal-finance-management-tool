import { BrowserRouter, Routes, Route } from "react-router-dom";
import ThemeProvider from "./theme";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import Homepage from "./pages/private/home";
import ProfilePage from "./pages/private/profile";
import PublicLayout from "./layouts/public-layout";
import PrivateLayout from "./layouts/private-layout";
import UsersPage from "./pages/private/admin/users";
// ...existing code...

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicLayout>
                <LoginPage />
              </PublicLayout>
            }
          />
          <Route
            path="/register"
            element={
              <PublicLayout>
                <RegisterPage />
              </PublicLayout>
            }
          />
          <Route
            path="/"
            element={
              <PrivateLayout>
                <Homepage />
              </PrivateLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateLayout>
                <ProfilePage />
              </PrivateLayout>
            }
          />
          {/* Remove the admin events routes */}
          {/* <Route
            path="/admin/events"
            element={
              <PrivateLayout>
                <EventsPage />
              </PrivateLayout>
            }
          />
          <Route
            path="/admin/events/create"
            element={
              <PrivateLayout>
                <CreateEvenetPage />
              </PrivateLayout>
            }
          />
          <Route
            path="/admin/events/edit/:id"
            element={
              <PrivateLayout>
                <EditEventPage />
              </PrivateLayout>
            }
          /> */}
          {/* Remove the event info route */}
          {/* <Route
            path="/event/:id"
            element={
              <PrivateLayout>
                <EventInfoPage />
              </PrivateLayout>
            }
          /> */}
          <Route
            path="/admin/users"
            element={
              <PrivateLayout>
                <UsersPage />
              </PrivateLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
