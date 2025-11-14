import { Container, Button } from 'react-bootstrap';

const Index = () => {
  return (
    <Container className="d-flex flex-column justify-content-center align-items-center text-center vh-100">
      <h1 className="display-1 fw-bold text-danger">404</h1>
      <h2 className="mb-3">Página no encontrada</h2>
      <p className="text-muted">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
      <Button variant="primary" href="/dashboard/default">Volver al inicio</Button>
    </Container>
  );
};

export default Index;
