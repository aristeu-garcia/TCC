"use client"; // no Next.js padrão, pode retirar isso, ou só usar o código normal

import { useState } from "react";
import axios from "axios";

export default function HomePage() {
  const [updateData, setUpdateData] = useState(null);
  const [fetchData, setFetchData] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [errorUpdate, setErrorUpdate] = useState(null);
  const [errorFetch, setErrorFetch] = useState(null);

  const handleUpdate = async () => {
    setLoadingUpdate(true);
    setErrorUpdate(null);
    setUpdateData(null);
    try {
      
      const response = await axios.get("http://localhost:3001/categories", {
        headers: {
          "Content-Type": "application/json"
        },
      })
      console.log(response);
      // setUpdateData(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setErrorUpdate("Falha ao atualizar dados.", error);
      console.log(error);
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleFetch = async () => {
    setLoadingFetch(true);
    setErrorFetch(null);
    setFetchData(null);
    try {
      const response = await axios.get("/api/fetch-data");
      setFetchData(response.data);
    } catch (error) {
      setErrorFetch("Falha ao buscar dados.");
    } finally {
      setLoadingFetch(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <h1 className="text-center text-xl mb-6">Interação com API</h1>
        <div className="mb-6">
          <button
            onClick={handleUpdate}
            disabled={loadingUpdate}
            className="btn"
          >
            {loadingUpdate ? "Atualizando..." : "Atualizar"}
          </button>
          {errorUpdate && <p className="text-red-500 mt-2">{errorUpdate}</p>}
          {updateData && (
            <pre className="mt-2 p-2 bg-gray-100 rounded max-h-40 overflow-auto">
              {updateData}
            </pre>
          )}
        </div>
        <div>
          <button onClick={handleFetch} disabled={loadingFetch} className="btn">
            {loadingFetch ? "Buscando..." : "Buscar"}
          </button>
          {errorFetch && <p className="text-red-500 mt-2">{errorFetch}</p>}
          {fetchData &&
            (Array.isArray(fetchData) && fetchData.length > 0 ? (
              <ul className="list-disc pl-5 mt-2">
                {fetchData.map((item) => (
                  <li key={item.id}>
                    {item.name} (ID: {item.id})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2">
                Nenhum item encontrado ou formato inesperado.
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}