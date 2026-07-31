import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/AuthContext";
import AdminRoute from "@/components/AdminRoute";
import Layout from "./Layout";
import ScrollToTop from "./components/ScrollToTop";
import GerenciarCadastros from "./pages/GerenciarCadastros";
import NovaSolicitacao from "./pages/NovaSolicitacao";
import EditarSituacao from "./pages/EditarSituacao";
import GerarRelatorios from "./pages/GerarRelatorios";
import Graficos from "./pages/Graficos";
import PageNotFound from "./lib/PageNotFound";

function AdminApp() {
  return (
    <AuthProvider>
      <AdminRoute />
    </AuthProvider>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/solicitacao-vaga" element={<NovaSolicitacao />} />
        <Route path="/nova-solicitacao" element={<Navigate to="/solicitacao-vaga" replace />} />
        <Route path="/NovaSolicitacao" element={<Navigate to="/solicitacao-vaga" replace />} />
        <Route element={<AdminApp />}>
          <Route element={<Layout />}>
            <Route path="/admin/forms" element={<GerenciarCadastros />} />
            <Route path="/GerenciarCadastros" element={<Navigate to="/admin/forms" replace />} />
            <Route path="/admin/forms/editar-situacao" element={<EditarSituacao />} />
            <Route path="/EditarSituacao" element={<Navigate to="/admin/forms/editar-situacao" replace />} />
            <Route path="/admin/forms/gerar-relatorios" element={<GerarRelatorios />} />
            <Route path="/GerarRelatorios" element={<Navigate to="/admin/forms/gerar-relatorios" replace />} />
            <Route path="/admin/forms/graficos" element={<Graficos />} />
            <Route path="/Graficos" element={<Navigate to="/admin/forms/graficos" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
