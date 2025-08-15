export default function handler(req, res) {
  res.status(200).json({
    message: "Dados atualizados com sucesso!",
    timestamp: new Date().toISOString(),
  });
}