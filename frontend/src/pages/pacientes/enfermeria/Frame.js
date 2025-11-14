import React from 'react';
import { menu } from './pages';

const buildMenuMap = (items, acc = new Map()) => {
  if (!Array.isArray(items)) {
    return acc;
  }

  items.forEach((item) => {
    if (item?.key) {
      acc.set(item.key, item);
    }
    if (item?.children && item.children.length > 0) {
      buildMenuMap(item.children, acc);
    }
  });

  return acc;
};

const menuMap = buildMenuMap(menu);

const styles = {
  wrapper: {
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: '#f6f7fb'
  },
  card: {
    margin: '0 auto',
    maxWidth: '920px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
    padding: '2.5rem 3rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: '#1f2937'
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: '1.5rem',
    lineHeight: 1.6
  },
  tone: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.95rem',
    color: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
    fontWeight: 600,
    letterSpacing: '0.02em'
  }
};

const defaultView = {
  label: 'Vista no disponible',
  description:
    'Todavía no se ha configurado contenido para esta sección. Consulta con el equipo de producto para definir los requisitos.'
};

const PacientesEnfermeriaFrame = ({ match }) => {
  const viewKey = match?.params?.view;
  const entry = menuMap.get(viewKey) ?? defaultView;

  if (entry.component) {
    const Component = entry.component;
    return <Component />;
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.tone}>Módulo de Enfermería</div>
        <h1 style={styles.title}>{entry.label}</h1>
        <p style={styles.subtitle}>
          {entry.description ?? defaultView.description}
        </p>
        {entry.component ? <entry.component /> : null}
      </div>
    </div>
  );
};

export default PacientesEnfermeriaFrame;
