import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, Users, PartyPopper, ArrowLeft } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  phone: string;
  confirmed: boolean;
}

type Step = "phone" | "select" | "success";

export const ConfirmationFlow = () => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const searchGuests = async () => {
    if (phone.length < 14) {
      toast.error("Digite um telefone válido");
      return;
    }

    setLoading(true);
    const cleanPhone = phone.replace(/\D/g, "");

    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("phone", cleanPhone);

    setLoading(false);

    if (error) {
      toast.error("Erro ao buscar convidados");
      return;
    }

    if (!data || data.length === 0) {
      toast.error("Nenhum convidado encontrado para este telefone");
      return;
    }

    setGuests(data);
    setSelectedGuests(data.filter((g) => g.confirmed).map((g) => g.id));
    setStep("select");
  };

  const toggleGuest = (id: string) => {
    setSelectedGuests((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const confirmAttendance = async () => {
    setLoading(true);

    // Update all guests: confirmed = true if selected, false otherwise
    const updates = guests.map((guest) =>
      supabase
        .from("guests")
        .update({ confirmed: selectedGuests.includes(guest.id) })
        .eq("id", guest.id)
    );

    await Promise.all(updates);
    setLoading(false);
    setStep("success");
    toast.success("Presença confirmada com sucesso!");
  };

  const reset = () => {
    setStep("phone");
    setPhone("");
    setGuests([]);
    setSelectedGuests([]);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {step === "phone" && (
        <div className="animate-fade-in space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-foreground">
              Confirme sua presença
            </h2>
            <p className="text-muted-foreground">
              Digite seu telefone para encontrar seu convite
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="tel"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={15}
              className="text-center text-lg h-14 bg-card border-2 focus:border-primary"
            />
            <Button
              onClick={searchGuests}
              disabled={loading || phone.length < 14}
              className="w-full h-12 text-lg font-semibold shadow-aurora"
            >
              {loading ? "Buscando..." : "Buscar convite"}
            </Button>
          </div>
        </div>
      )}

      {step === "select" && (
        <div className="animate-fade-in space-y-6">
          <button
            onClick={() => setStep("phone")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-foreground">
              Quem vai comparecer?
            </h2>
            <p className="text-muted-foreground">
              Selecione os convidados que irão à festa
            </p>
          </div>

          <div className="space-y-3">
            {guests.map((guest) => (
              <label
                key={guest.id}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border-2 border-transparent hover:border-primary/30 cursor-pointer transition-all"
              >
                <Checkbox
                  checked={selectedGuests.includes(guest.id)}
                  onCheckedChange={() => toggleGuest(guest.id)}
                  className="w-6 h-6"
                />
                <span className="text-lg font-medium">{guest.name}</span>
              </label>
            ))}
          </div>

          <Button
            onClick={confirmAttendance}
            disabled={loading}
            className="w-full h-12 text-lg font-semibold shadow-aurora"
          >
            {loading ? "Confirmando..." : `Confirmar ${selectedGuests.length} presença(s)`}
          </Button>
        </div>
      )}

      {step === "success" && (
        <div className="animate-fade-in text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-aurora-gold/20 rounded-full flex items-center justify-center animate-float">
            <PartyPopper className="w-10 h-10 text-aurora-gold" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-display font-semibold text-foreground">
              Presença Confirmada!
            </h2>
            <p className="text-muted-foreground">
              Estamos muito felizes em ter você conosco!
            </p>
          </div>

          <div className="bg-card rounded-xl p-6 space-y-2 border">
            <p className="font-semibold text-lg">Confirmados:</p>
            <ul className="space-y-1">
              {guests
                .filter((g) => selectedGuests.includes(g.id))
                .map((g) => (
                  <li key={g.id} className="text-muted-foreground">
                    ✨ {g.name}
                  </li>
                ))}
            </ul>
          </div>

          <Button
            variant="outline"
            onClick={reset}
            className="w-full h-12"
          >
            Confirmar outro convidado
          </Button>
        </div>
      )}
    </div>
  );
};
