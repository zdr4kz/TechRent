export async function POST(request) {
  try {
    const body = await request.json()

    const response = await fetch('http://localhost:3000/manutencao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Erro ao registrar manutenção:', error)
    return Response.json(
      { sucesso: false, mensagem: 'Erro ao registrar manutenção' },
      { status: 500 }
    )
  }
}
