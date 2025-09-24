import Patient from './Patient';
import Doctor from './Doctor';
import Insurance from './Insurance';
import PatientInsurance from './PatientInsurance';
import Order from './Order';
import OrderItem from './OrderItem';
import Sample from './Sample';
import Exam from './Exam';
import Parameter from './Parameter';
import Result from './Result';
import Panel from './Panel';
import PanelItem from './PanelItem';

export const applyAssociations = () => {
  // ── Patient ↔ Insurance (N–N) vía PatientInsurance
  Patient.belongsToMany(Insurance, { through: PatientInsurance, foreignKey: 'patient_id', otherKey: 'insurance_id', as: 'insurances' });
  Insurance.belongsToMany(Patient, { through: PatientInsurance, foreignKey: 'insurance_id', otherKey: 'patient_id', as: 'patients' });
  PatientInsurance.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
  PatientInsurance.belongsTo(Insurance, { foreignKey: 'insurance_id', as: 'insurance' });

  // ── Order relaciones
  Order.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
  Order.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
  Order.belongsTo(Insurance, { foreignKey: 'insurance_id', as: 'insurance' });
  Patient.hasMany(Order, { foreignKey: 'patient_id', as: 'orders' });
  Doctor.hasMany(Order, { foreignKey: 'doctor_id', as: 'orders' });
  Insurance.hasMany(Order, { foreignKey: 'insurance_id', as: 'orders' });

  // ── OrderItem y Exam
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
  OrderItem.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });
  Exam.hasMany(OrderItem, { foreignKey: 'exam_id', as: 'orderItems' });

  // ── Sample ↔ Order
  Sample.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  Order.hasMany(Sample, { foreignKey: 'order_id', as: 'samples' });

  // ── Parameter ↔ Exam (1–N)
  Parameter.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });
  Exam.hasMany(Parameter, { foreignKey: 'exam_id', as: 'parameters' });

  // ── Result (a todo)
  Result.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  Result.belongsTo(Sample, { foreignKey: 'sample_id', as: 'sample' });
  Result.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });
  Result.belongsTo(Parameter, { foreignKey: 'parameter_id', as: 'parameter' });
  Order.hasMany(Result, { foreignKey: 'order_id', as: 'results' });
  Sample.hasMany(Result, { foreignKey: 'sample_id', as: 'results' });
  Exam.hasMany(Result, { foreignKey: 'exam_id', as: 'results' });
  Parameter.hasMany(Result, { foreignKey: 'parameter_id', as: 'results' });

  // ── Panel y PanelItem (1–N)
  Panel.hasMany(PanelItem, { foreignKey: 'panel_id', as: 'items' });
  PanelItem.belongsTo(Panel, { foreignKey: 'panel_id', as: 'panel' });

  // Si usan PanelItem.kind === 'EXAM'/'PARAM', los FKs ya están definidos en el modelo
};
