import { Container, Button } from 'react-bootstrap';

const Index = () => {
  return (
    <Container className="d-flex flex-column justify-content-center align-items-center text-center vh-100">
      <img
        src="https://media.giphy.com/media/FPbnShq1h1IS5FQyPD/giphy.gif"
        alt="Trabajando en esto"
        className="mb-4"
        style={{ width: '250px', maxWidth: '100%' }}
      />
      <h2 className="mb-3 text-primary">Estamos trabajando en esto</h2>
      <p className="text-muted">
        Esta sección estará disponible pronto. Nuestro equipo de programacion ya está en ello.
      </p>
      <Button variant="outline-primary" href="/dashboard/default">
        Volver al inicio
      </Button>
    </Container>
  );
};

export default Index;
