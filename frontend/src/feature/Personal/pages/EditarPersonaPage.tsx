import { Container, Spinner, Alert, Col, Row } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { mutate } from 'swr'
import { PageHeader } from '../../../components/PageHeader'
import { PersonaForm } from '../components/PersonaForm'
import { api } from '../../../libs/axios'
import { useApi } from '../../../hooks/useApi'
import type { NewPersona, Persona } from '../types'

export function EditarPersonaPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const { data: persona, isLoading, error } = useApi<Persona>(`/personal/${id}`)

  const actualizarPersona = async (datos: NewPersona) => {
    try {
      const { data: actualizada } = await api.put<Persona>(`/personal/${id}`, datos)
      await mutate(`/personal/${id}`, actualizada, false)
      await mutate('/personal/')
      navigate('/personal')
    } catch (error) {
      alert('No se pudo editar la persona.')
      console.log(error)
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Editar capacidades" />
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </>
    )
  }

  if (!persona) {
    return (
      <Container>
        <PageHeader title="Persona no encontrada" />
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="danger">La persona ingresada no existe</Alert>
          </Col>
        </Row>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <PageHeader title="Editar capacidades" />
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="danger">Ocurrió un error al cargar la persona</Alert>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <>
      <PageHeader title="Editar capacidades" />
      <Container>
        <PersonaForm
          key={`${persona.id}-${persona.operar}-${persona.administrar}-${persona.nombre}`}
          textoBoton="Guardar capacidades"
          onSubmit={actualizarPersona}
          valoresIniciales={{
            nombre: persona.nombre,
            operar: persona.operar,
            administrar: persona.administrar,
          }}
        />
      </Container>
    </>
  )
}
