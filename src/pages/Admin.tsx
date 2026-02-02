import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, User, Phone, Check, X, Users, Lock, LogOut } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  phone: string;
  confirmed: boolean;
  created_at: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem("aurora_admin_token");
    if (token) {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGuests();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: { username, password },
      });

      if (error) throw error;

      if (data.success && data.token) {
        localStorage.setItem("aurora_admin_token", data.token);
        setIsAuthenticated(true);
        toast.success("Login realizado com sucesso!");
      } else {
        toast.error(data.error || "Erro ao fazer login");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Usuário ou senha inválidos");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("aurora_admin_token");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    toast.success("Logout realizado");
  };

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar convidados");
      return;
    }

    setGuests(data || []);
    setLoading(false);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPhone(formatPhone(e.target.value));
  };

  const addGuest = async () => {
    if (!newName.trim() || newPhone.length < 14) {
      toast.error("Preencha todos os campos");
      return;
    }

    setAdding(true);
    const cleanPhone = newPhone.replace(/\D/g, "");

    const { error } = await supabase.from("guests").insert({
      name: newName.trim(),
      phone: cleanPhone,
    });

    setAdding(false);

    if (error) {
      toast.error("Erro ao adicionar convidado");
      return;
    }

    toast.success("Convidado adicionado!");
    setNewName("");
    setNewPhone("");
    fetchGuests();
  };

  const deleteGuest = async (id: string, name: string) => {
    if (!confirm(`Remover ${name} da lista?`)) return;

    const { error } = await supabase.from("guests").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao remover convidado");
      return;
    }

    toast.success("Convidado removido");
    fetchGuests();
  };

  const confirmedCount = guests.filter((g) => g.confirmed).length;
  const totalCount = guests.length;

  // Loading state while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-aurora-lg border">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Área Administrativa
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Aurora - 1º Aniversário
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                disabled={authLoading || !username || !password}
                className="w-full h-12 text-lg font-semibold shadow-aurora"
              >
                {authLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Voltar para o convite
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin panel (authenticated)
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o convite
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          <h1 className="text-3xl font-display font-bold text-foreground">
            Gerenciar Convidados
          </h1>
          <p className="text-muted-foreground mt-1">
            Aniversário de 1 ano da Aurora
          </p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCount}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-aurora-gold/20 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-aurora-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{confirmedCount}</p>
                <p className="text-sm text-muted-foreground">Confirmados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Guest Form */}
        <div className="bg-card rounded-xl p-6 border shadow-sm mb-8">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Adicionar Convidado
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nome do convidado"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="(11) 99999-9999"
                  value={newPhone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                  className="pl-10"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Use o mesmo telefone para convidados da mesma família
            </p>
            <Button
              onClick={addGuest}
              disabled={adding || !newName.trim() || newPhone.length < 14}
              className="w-full md:w-auto"
            >
              {adding ? "Adicionando..." : "Adicionar"}
            </Button>
          </div>
        </div>

        {/* Guest List */}
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg">
            Lista de Convidados
          </h2>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-card rounded-xl border">
              Nenhum convidado cadastrado ainda
            </div>
          ) : (
            <div className="space-y-2">
              {guests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between bg-card rounded-lg p-4 border shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        guest.confirmed
                          ? "bg-aurora-gold/20 text-aurora-gold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {guest.confirmed ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{guest.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPhone(guest.phone)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteGuest(guest.id, guest.name)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
