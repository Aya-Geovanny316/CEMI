import React, { useMemo, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { ContextProvider, useMyContext } from './Context';
import HorizontalMenu from '../HorizontalMenu';
import NursingPatientForm from './Form';

const findMenuByKey = (items, key) => {
  if (!Array.isArray(items) || !key) {
    return null;
  }

  for (const item of items) {
    if (item?.key === key) {
      return item;
    }
    if (item?.children) {
      const nested = findMenuByKey(item.children, key);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
};

const NursingPage = () => {
  const {
    menuItems,
    activeMenuKey,
    iframeSrc,
    patient,
    handleMenuSelect,
    handlePatientFormSubmit
  } = useMyContext();
  const [showModal, setShowModal] = useState(false);

  const activeMenuItem = useMemo(
    () => findMenuByKey(menuItems, activeMenuKey),
    [menuItems, activeMenuKey]
  );

  const iframeTitle = activeMenuItem?.label ?? 'Vista sin título';

  return (
    <>
      <NursingPatientForm patient={patient} onSave={handlePatientFormSubmit} />
      <HorizontalMenu
        items={menuItems}
        activeKey={activeMenuKey}
        onSelect={handleMenuSelect}
      />
      <div className="d-flex justify-content-end mb-2">
        <Button
          variant="outline-primary"
          size="sm"
          disabled={!iframeSrc}
          onClick={() => setShowModal(true)}
        >
          Ver en pantalla completa
        </Button>
      </div>
      <iframe
        src={iframeSrc || 'about:blank'}
        title="Enfermeria"
        style={{ width: '100%', height: '400px', border: 'none' }}
      />
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="xl"
        dialogClassName="enfermeria-modal-wide"
      >
        <Modal.Header closeButton>
          <Modal.Title>{iframeTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <iframe
            src={iframeSrc || 'about:blank'}
            title={`${iframeTitle} - modal`}
            style={{
              width: '100%',
              height: 'calc(90vh - 72px)',
              border: 'none'
            }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

const Index = () => (
  <ContextProvider>
    <NursingPage />
  </ContextProvider>
);

export default Index;
