export async function GET(request) {
  try {
    const response = await fetch('http://localhost:3000/chamados', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    })

    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Erro ao listar chamados:', error)
    return Response.json(
      { sucesso: false, mensagem: 'Erro ao listar chamados' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    const response = await fetch('http://localhost:3000/chamados', {
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
    console.error('Erro ao criar chamado:', error)
    return Response.json(
      { sucesso: false, mensagem: 'Erro ao criar chamado' },
      { status: 500 }
    )
  }
}
