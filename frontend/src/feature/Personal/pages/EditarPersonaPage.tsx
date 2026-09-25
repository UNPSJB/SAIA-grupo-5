import { Container, Spinner, Alert, Col, Row } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { mutate } from 'swr'
import { PageHeader } from '../../../components/PageHeader'
import { PersonaForm } from '../components/PersonaForm'
import { api } from '../../../libs/axios'
import { useApi } from '../../../hooks/useApi'
import { useAuth } from '../../../hooks/useAuth'
import type { NewPersona, Persona } from '../types'

export function EditarPersonaPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { currentUser, refreshCurrentUser } = useAuth()

  const { data: persona, isLoading, error } = useApi<Persona>(`/personal/${id}`)

  const actualizarPersona = async (datos: NewPersona) => {
    try {
      const { data: actualizada } = await api.put<Persona>(`/personal/${id}`, datos)
      await mutate(`/personal/${id}`, actualizada, false)

      // Si te editaste a vos mismo (ej. te sacaste el permiso de administrar),
      // el estado de currentUser queda desactualizado y el resto de la app
      // sigue pensando que tenés los permisos viejos hasta que se refresque.
      if (currentUser && actualizada.id === currentUser.id) {
        await refreshCurrentUser()
      }

      await mutate('/personal/')
      navigate('/personal')
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'No se pudo editar la persona.'
      alert(detail)
      console.log(err)
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Editar personal" />
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
        <PageHeader title="Editar personal" />
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="danger">Ocurrió un error al cargar la persona</Alert>
          </Col>
        </Row>
      </Container>
    )
  }

  if (!persona.activo) {
    return (
      <Container>
        <PageHeader title="Editar personal" />
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="warning">No se puede editar una persona dada de baja.</Alert>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <>
      <PageHeader title="Editar personal" />
      <Container>
        <PersonaForm
          key={`${persona.id}-${persona.operar}-${persona.administrar}-${persona.nombre}`}
          textoBoton="Guardar cambios"
          isEditing={true}
          onSubmit={actualizarPersona}
          valoresIniciales={{
            nombre: persona.nombre,
            apellido: persona.apellido,
            dni: persona.dni,
            mail: persona.mail,
            username: persona.username,
            operar: persona.operar,
            administrar: persona.administrar,
          }}
        />
      </Container>
    </>
  )
}
