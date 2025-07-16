import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import createStore from "react-auth-kit/createStore";
import AuthKitProvider from "react-auth-kit";
import { Routes, Route } from "react-router";
import Login from "./pages/login";
import MainLayout from "./components/MainLayout";
import { ConfigProvider } from "antd";
import frFR from "antd/lib/locale/fr_FR";

const queryClient = new QueryClient();

function App() {
  const store = createStore({
    authName: 'resident_auth',
    authType: 'localstorage',
    cookieDomain: window.location.hostname,
    cookieSecure: window.location.protocol === 'https:',
  });
    return (
      <AuthKitProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider locale={frFR}>
            <Routes>
              {/* Route publique de connexion */}
              <Route index element={<Login />} />
              <Route path="login" element={<Login />} />
              
              {/* Routes protégées avec authentification */}

                {/* Layout principal avec navigation commune */}
                <Route path='dashboard/*' element={<MainLayout />}/>
            </Routes>
          </ConfigProvider>
        </QueryClientProvider>
      </AuthKitProvider>
    );
}

export default App
