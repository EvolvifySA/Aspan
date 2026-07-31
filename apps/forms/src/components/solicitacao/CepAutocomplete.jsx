import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function CepAutocomplete({ value, onChange, onAddressChange }) {
  const [loading, setLoading] = useState(false);

  const handleCepChange = async (cep) => {
    onChange(cep);
    
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          onAddressChange({
            rua: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => handleCepChange(e.target.value)}
        placeholder="00000-000"
        maxLength={9}
      />
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-gray-400" />
      )}
    </div>
  );
}