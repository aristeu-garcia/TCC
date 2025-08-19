"use client"; 
import { useState } from "react";
import axios from "axios";

export default function HomePage() {
  const [updateData, setUpdateData] = useState(null);
  const [fetchData, setFetchData] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [errorUpdate, setErrorUpdate] = useState(null);
  const [errorFetch, setErrorFetch] = useState(null);

  const [authCode, setAuthCode] = useState(""); 
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);

  // Atualizar categorias (rota PUT /refresh-categories)
  const handleUpdate = async () => {
    setLoadingUpdate(true);
    setErrorUpdate(null);
    setUpdateData(null);
    try {
      const response = await axios.put("http://localhost:3001/refresh-categories", {}, {
        headers: { "Content-Type": "application/json" },
      });
      setUpdateData("Categorias atualizadas com sucesso!");
    } catch (error) {
      setErrorUpdate("Falha ao atualizar categorias.");
      console.error(error);
    } finally {
      setLoadingUpdate(false);
    }
  };

  // Buscar categorias (rota GET /categories)
  const handleFetch = async () => {
    setLoadingFetch(true);
    setErrorFetch(null);
    setFetchData(null);
    try {
      const response = await axios.get("http://localhost:3001/categories");
      setFetchData(response.data);
    } catch (error) {
      setErrorFetch("Falha ao buscar categorias.");
      console.error(error);
    } finally {
      setLoadingFetch(false);
    }
  };

  // Login com o code
  const handleLogin = async () => {
    if (!authCode) {
      setLoginMessage("Informe o código de autorização.");
      return;
    }
    setLoadingLogin(true);
    setLoginMessage(null);
    try {
      const response = await axios.post("http://localhost:3001/auth/callback", {
        code: authCode,
      });
      setLoginMessage(`✅ ${response.data.message}`);
    } catch (error) {
      console.error(error);
      setLoginMessage("❌ Falha ao autenticar. Verifique o código.");
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded shadow p-6 space-y-6">
        <h1 className="text-center text-xl">Interação com API</h1>

        {/* Bloco de login */}
        <div className="space-y-3">
          <h3 className="text-lg">
            No terminal do back-end foi gerado um link. Clique nele, copie o código do navegador e cole abaixo:
          </h3>
          <input
            type="text"
            placeholder="Cole o code aqui..."
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            className="w-full border rounded p-2"
          />
          <button
            onClick={handleLogin}
            disabled={loadingLogin}
            className="btn w-full"
          >
            {loadingLogin ? "Autenticando..." : "Logar"}
          </button>
          {loginMessage && <p className="text-sm mt-2">{loginMessage}</p>}
        </div>

        {/* Botão atualizar */}
        <div>
          <button
            onClick={handleUpdate}
            disabled={loadingUpdate}
            className="btn w-full"
          >
            {loadingUpdate ? "Atualizando..." : "Atualizar categorias"}
          </button>
          {errorUpdate && <p className="text-red-500 mt-2">{errorUpdate}</p>}
          {updateData && (
            <p className="mt-2 p-2 bg-green-100 rounded">{updateData}</p>
          )}
        </div>

        {/* Botão buscar */}
        <div>
          <button
            onClick={handleFetch}
            disabled={loadingFetch}
            className="btn w-full"
          >
            {loadingFetch ? "Buscando..." : "Buscar categorias"}
          </button>
          {errorFetch && <p className="text-red-500 mt-2">{errorFetch}</p>}
          {fetchData &&
            (Array.isArray(fetchData) && fetchData.length > 0 ? (
              <ul className="list-disc pl-5 mt-2 max-h-40 overflow-auto">
                {fetchData.map((item) => (
                  <li key={item.id}>
                    {item.name} (ID: {item.id})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2">Nenhuma categoria encontrada.</p>
            ))}
        </div>
      </div>
    </div>
  );
}
