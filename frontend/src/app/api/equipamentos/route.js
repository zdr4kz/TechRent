export async function GET(request) {
  try {
    const response = await fetch('http://localhost:3000/equipamentos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    })

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Erro ao buscar equipamentos:', error)
    return Response.json(
      { sucesso: false, mensagem: 'Erro ao buscar equipamentos' },
      { status: 500 }
    )
  }
}
