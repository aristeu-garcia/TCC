"use client";
import { useState } from "react";
import axios from "axios";
import styled from "@emotion/styled";

// Estilização com Emotion
const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 1rem;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  color: #1f2937;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  color: #1f2937;
  &::placeholder {
    color: #9ca3af;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #d1d5db;
    outline-offset: 1px;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    filter: brightness(0.9);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoginButton = styled(Button)`
  background-color: #1f2937;
  &:hover {
    background-color: #374151;
  }
`;

const UpdateButton = styled(Button)`
  background-color: #10b981;
  &:hover {
    background-color: #059669;
  }
`;

const FetchButton = styled(Button)`
  background-color: #8b5cf6;
  &:hover {
    background-color: #7c3aed;
  }
`;

const Message = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #374151;
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.p`
  color: #16a34a;
  font-size: 0.875rem;
`;

// Estilização para a Tabela
const CategoryTableContainer = styled.div`
  max-height: 10rem;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const TableHeader = styled.thead`
  background-color: #f3f4f6;
`;

const TableRow = styled.tr`
  &:nth-of-type(odd) {
    background-color: #f9fafb;
  }
  &:hover {
    background-color: #e5e7eb;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #4b5563;
`;

// Componente principal
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

  const handleUpdate = async () => {
    setLoadingUpdate(true);
    setErrorUpdate(null);
    setUpdateData(null);
    try {
      await axios.put("http://localhost:3001/refresh-categories", {}, {
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
    <PageContainer>
      <ContentWrapper>
        {/* Card Login */}
        <Card>
          <Title>Login</Title>
          <Input
            type="text"
            placeholder="Email"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
          />
          <LoginButton
            onClick={handleLogin}
            disabled={loadingLogin}
          >
            {loadingLogin ? "Logando..." : "Logar"}
          </LoginButton>
          {loginMessage && <Message>{loginMessage}</Message>}
        </Card>

        {/* Card Categorias */}
        <Card>
          <UpdateButton
            onClick={handleUpdate}
            disabled={loadingUpdate}
          >
            {loadingUpdate ? "Atualizando..." : "Atualizar categorias"}
          </UpdateButton>
          {errorUpdate && <ErrorMessage>{errorUpdate}</ErrorMessage>}
          {updateData && <SuccessMessage>{updateData}</SuccessMessage>}

          <FetchButton
            onClick={handleFetch}
            disabled={loadingFetch}
          >
            {loadingFetch ? "Buscando..." : "Buscar categorias"}
          </FetchButton>
          {errorFetch && <ErrorMessage>{errorFetch}</ErrorMessage>}
          {fetchData &&
            (Array.isArray(fetchData) && fetchData.length > 0 ? (
              <CategoryTableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>ID</TableHeaderCell>
                      <TableHeaderCell>Nome</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {fetchData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </CategoryTableContainer>
            ) : (
              <Message>Nenhuma categoria encontrada.</Message>
            ))}
        </Card>
      </ContentWrapper>
    </PageContainer>
  );
}