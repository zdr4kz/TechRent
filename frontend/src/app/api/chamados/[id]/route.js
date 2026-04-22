export async function PATCH(request, { params }) {
    try {
        const { id } = await params
        const body = await request.json()

        console.log('[PATCH /api/chamados/[id]] ID:', id)
        console.log('[PATCH /api/chamados/[id]] Body:', body)
        console.log('[PATCH /api/chamados/[id]] Authorization:', request.headers.get('Authorization')?.substring(0, 20) + '...')

        const response = await fetch(`http://localhost:3000/chamados/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            },
            body: JSON.stringify(body),
        })

        console.log('[PATCH /api/chamados/[id]] Response status:', response.status)

        const data = await response.json()
        
        console.log('[PATCH /api/chamados/[id]] Response data:', data)
        
        return Response.json(data, { status: response.status })
    } catch (error) {
        console.error('[PATCH /api/chamados/[id]] Erro:', error)
        return Response.json(
            { sucesso: false, mensagem: 'Erro ao atualizar chamado', erro: error.message }
        )
    }
}
