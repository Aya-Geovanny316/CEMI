import { Container, Button } from 'react-bootstrap';

const Index = () => {
  return (
    <Container className="d-flex flex-column justify-content-center align-items-center text-center vh-100">
      <img
        src="https://media.giphy.com/media/HzPtbOKyBoBFsK4hyc/giphy.gif?cid=ecf05e47pb686nkcwt1laa7h8xn5ni7nohl9nugkwih0ipey&ep=v1_gifs_search&rid=giphy.gif&ct=g"
        alt="Próximamente"
        className="mb-4"
        style={{ width: '250px', maxWidth: '100%' }}
      />
      <h2 className="mb-3 text-warning">En un futuro...</h2>
      <p className="text-muted">
        Esta sección aún no está disponible, pero estamos planeando grandes cosas para ti.
      </p>
      <Button variant="outline-warning" href="/#/dashboard/default">
        Volver al inicio
      </Button>
    </Container>
  );
};

export default Index;
