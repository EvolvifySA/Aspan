import { useCallback, useEffect, useState } from "react";
import { solicitacaoApi } from "@/lib/api";

export function useSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await solicitacaoApi.list();
      setSolicitacoes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err);
      setSolicitacoes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    solicitacoes,
    isLoading,
    error,
    refresh,
    setSolicitacoes,
  };
}
