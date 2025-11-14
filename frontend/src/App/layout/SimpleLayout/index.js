import React from 'react';
import './layout.css';

/**
 * SimpleLayout is a minimal wrapper that supports any number of children
 * and exposes CSS variables so colors can be customized easily.
 *
 * Usage:
 * <SimpleLayout theme={{ background: '#000', text: '#fff', primary: '#0d6efd' }}>
 *   ...children
 * </SimpleLayout>
 */
const SimpleLayout = ({ children, theme = {} }) => {
  const style = {
    '--background-color': theme.background || '',
    '--text-color': theme.text || '',
    '--primary-color': theme.primary || ''
  };

  return (
    <div className="simple-layout" style={style}>
      {children}
    </div>
  );
};

export default SimpleLayout;
