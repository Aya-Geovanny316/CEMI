import InfoPaciente from '../subPages/infoPaciente';
import MedicoTratante from '../subPages/medicoTratante';
import HistoriaEnfermedad from '../subPages/historiaEnfermedad';
import SignosVitalesEmergencia from '../subPages/signosVitalesEmergencia';
import SeguimientoOrdenesMedicas from '../subPages/seguimientoOrdenesMedicas';
import Antecedentes from '../subPages/antecedentes';
import Evolucion from '../subPages/evolucion';
import ControlMedicamento from '../subPages/controlMedicamento';
import NotasEnfermeria from '../subPages/notasEnfermeria';
import Laboratorios from '../subPages/laboratorios';
import Imagenes from '../subPages/imagenes';
import Dietas from '../subPages/dietas';
import IngestaExcreta from '../subPages/ingestaExcreta';
import SignosVitalesEncamamiento from '../subPages/signosVitalesEncamamiento';
import SolicitudMedicamentos from '../subPages/solicitudMedicamentos';

const BASE_IFRAME_PATH = '/#/dashboard/pacientes/enfermeria/iframe';

export const menu = [
  {
    key: 'informacion-paciente',
    label: 'Informacion del Paciente',
    iframe: `${BASE_IFRAME_PATH}/informacion-paciente`,
    component: InfoPaciente
  },
  {
    key: 'medico-tratante',
    label: 'Medico Tratante',
    iframe: `${BASE_IFRAME_PATH}/medico-tratante`,
    component: MedicoTratante
  },
  {
    key: 'historia-enfermedad',
    label: 'Historia de la Enfermedad',
    iframe: `${BASE_IFRAME_PATH}/historia-enfermedad`,
    component: HistoriaEnfermedad
  },
  {
    key: 'signos-vitales-emergencia',
    label: 'Signos Vitales (Emergencia)',
    iframe: `${BASE_IFRAME_PATH}/signos-vitales-emergencia`,
    component: SignosVitalesEmergencia
  },
  {
    key: 'seguimiento-ordenes-medicas',
    label: 'Seguimiento Ordenes Medicas',
    iframe: `${BASE_IFRAME_PATH}/seguimiento-ordenes-medicas`,
    component: SeguimientoOrdenesMedicas
  },
  {
    key: 'antecedentes',
    label: 'Antecedentes',
    iframe: `${BASE_IFRAME_PATH}/antecedentes`,
    component: Antecedentes
  },
  {
    key: 'evolucion',
    label: 'Evolucion',
    iframe: `${BASE_IFRAME_PATH}/evolucion`,
    component: Evolucion
  },
  {
    key: 'control-medicamento',
    label: 'Control de Medicamento',
    iframe: `${BASE_IFRAME_PATH}/control-medicamento`,
    component: ControlMedicamento
  },
  {
    key: 'notas-enfermeria',
    label: 'Notas de Enfermeria',
    iframe: `${BASE_IFRAME_PATH}/notas-enfermeria`,
    component: NotasEnfermeria
  },
  {
    key: 'laboratorios',
    label: 'Laboratorios',
    iframe: `${BASE_IFRAME_PATH}/laboratorios`,
    component: Laboratorios
  },
  {
    key: 'imagenes',
    label: 'Imagenes',
    iframe: `${BASE_IFRAME_PATH}/imagenes`,
    component: Imagenes
  },
  {
    key: 'dietas',
    label: 'Dietas',
    iframe: `${BASE_IFRAME_PATH}/dietas`,
    component: Dietas
  },
  {
    key: 'ingesta-excreta',
    label: 'Ingesta Excreta',
    iframe: `${BASE_IFRAME_PATH}/ingesta-excreta`,
    component: IngestaExcreta
  },
  {
    key: 'signos-vitales-encamamiento',
    label: 'Signos Vitales (Encamamiento)',
    iframe: `${BASE_IFRAME_PATH}/signos-vitales-encamamiento`,
    component: SignosVitalesEncamamiento
  },
  {
    key: 'solicitud-medicamentos',
    label: 'Solicitud de Medicamentos',
    iframe: `${BASE_IFRAME_PATH}/solicitud-medicamentos`,
    component: SolicitudMedicamentos
  }
];
