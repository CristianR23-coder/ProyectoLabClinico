import { faker } from '@faker-js/faker';
import sequelize from '../database/db';

import { User } from '../database/models/auth/User';
import bcrypt from 'bcryptjs';
import { Role } from '../database/models/auth/Role';
import { RoleUser } from '../database/models/auth/RoleUser';
import { Doctor } from '../database/models/Doctor';
import { Insurance } from '../database/models/Insurance';
import { Patient } from '../database/models/Patient';
import { PatientInsurance } from '../database/models/PatientInsurance';
import { Exam } from '../database/models/Exam';
import { Parameter } from '../database/models/Parameter';
import { Panel } from '../database/models/Panel';
import { PanelItem } from '../database/models/PanelItem';
import { Order } from '../database/models/Order';
import { OrderItem } from '../database/models/OrderItem';
import { Sample } from '../database/models/Sample';
import { Result } from '../database/models/Result';

async function createFakeData() {
  const dialect = sequelize.getDialect();
  const rolesMap = new Map<string, any>();
  try {
    if (dialect === 'mysql') {
      // Desactivar temporalmente las comprobaciones de FK para poder dropear tablas con dependencias
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    } else if (dialect === 'mssql') {
      // Elimina todas las FK antes de sincronizar con force:true para evitar errores de múltiples dependencias
      const dropFkSql = `
        DECLARE @sql NVARCHAR(MAX) = N'';
        SELECT @sql = @sql + 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(pt.schema_id)) + '.' + QUOTENAME(pt.name) +
                       ' DROP CONSTRAINT ' + QUOTENAME(fk.name) + ';'
        FROM sys.foreign_keys fk
        JOIN sys.tables pt ON fk.parent_object_id = pt.object_id;
        IF LEN(@sql) > 0 EXEC sp_executesql @sql;
      `;
      await sequelize.query(dropFkSql);
    }

    await sequelize.sync({ force: true });
    console.log('DB synced — creating fake data...');
    // Ensure basic roles exist so we can link RoleUser entries
    const baseRoles = ['PATIENT', 'DOCTOR', 'ADMIN', 'STAFF'];
    for (const rn of baseRoles) {
      let r = await Role.findOne({ where: { name: rn } });
      if (!r) r = await Role.create({ name: rn, is_active: 'ACTIVE' } as any);
      rolesMap.set(rn, r);
    }
  } finally {
    if (dialect === 'mysql') {
      // Reactivar comprobaciones de FK
      try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      } catch (e) {
        // no bloquear el proceso si falla al reactivar
        console.warn('Warning: could not re-enable FOREIGN_KEY_CHECKS', e);
      }
    } else if (dialect === 'mssql') {
      // No es necesario restaurar las FK: sync() las recrea al volver a crear las tablas
    }
  }

  // Doctors (linked to some users)
  const doctors: Doctor[] = [];
  for (let i = 0; i < 8; i++) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const name = `${first} ${last}`;
    const docNumber = faker.string.numeric(8);

    // create user for doctor: username = name (no spaces, lowercase), password = docNumber
    const usernameBase = `${first}${last}`.replace(/\s+/g, '').normalize('NFD').replace(/[^\w]/g, '').toLowerCase();
    let username = usernameBase;
    let suffix = 1;
    while (await User.findOne({ where: { username } })) {
      username = `${usernameBase}${suffix++}`;
    }
    const hashed = await bcrypt.hash(docNumber, 8);
    const user = await User.create({ username, password: hashed, role: 'DOCTOR', status: 'ACTIVE' } as any);
    // link to RoleUser table
    try {
      const role = rolesMap.get('DOCTOR');
      if (role) await RoleUser.create({ role_id: role.id, user_id: user.id, is_active: 'ACTIVE' } as any);
    } catch (err) {
      // no bloquear la creación de datos si falla el linkeo
      console.warn('Warning: could not create RoleUser for doctor', err);
    }

    const d = await Doctor.create({
      docType: 'DNI',
      docNumber: docNumber,
      name: name,
      specialty: faker.word.words({ count: 2 }),
      medicalLicense: faker.string.alphanumeric(6).toUpperCase(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      user_id: user.id,
      status: 'ACTIVE',
    } as any);
    doctors.push(d);
  }

  // Insurances
  const insurances: Insurance[] = [];
  for (let i = 0; i < 6; i++) {
    const ins = await Insurance.create({
      name: faker.company.name(),
      nit: faker.string.numeric(9),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      status: 'ACTIVE',
    } as any);
    insurances.push(ins);
  }

  // Patients
  const patients: Patient[] = [];
  const patientInsuranceMap = new Map<number, number>();
  for (let i = 0; i < 30; i++) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const docNumber = faker.string.numeric(8);

    // create user for patient: username = firstname+lastname lowercase, password = docNumber
    const usernameBase = `${first}${last}`.replace(/\s+/g, '').normalize('NFD').replace(/[^\w]/g, '').toLowerCase();
    let username = usernameBase;
    let suffix = 1;
    while (await User.findOne({ where: { username } })) {
      username = `${usernameBase}${suffix++}`;
    }
    const hashed = await bcrypt.hash(docNumber, 8);
    const user = await User.create({ username, password: hashed, role: 'PATIENT', status: 'ACTIVE' } as any);
    // link to RoleUser table
    try {
      const role = rolesMap.get('PATIENT');
      if (role) await RoleUser.create({ role_id: role.id, user_id: user.id, is_active: 'ACTIVE' } as any);
    } catch (err) {
      console.warn('Warning: could not create RoleUser for patient', err);
    }

    const chosenInsurance = faker.helpers.arrayElement(insurances);
    const p = await Patient.create({
      docType: 'DNI',
      docNumber: docNumber,
      firstName: first,
      lastName: last,
      birthDate: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
      gender: faker.person.sex(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
      userId: user.id,
      status: 'ACTIVE',
    } as any);

    // Populate the many-to-many join table
    await PatientInsurance.create({
      patientId: p.id,
      insuranceId: chosenInsurance.id,
      policyNumber: faker.string.numeric(8),
      plan: faker.helpers.arrayElement(['BASIC', 'PREMIUM', 'PLUS']),
      startDate: faker.date.past({ years: 1 }).toISOString().slice(0, 10),
      status: 'ACTIVE',
    } as any);

    patients.push(p);
    patientInsuranceMap.set(p.id, chosenInsurance.id);
  }

  // Exams
  const exams: Exam[] = [];
  for (let i = 0; i < 15; i++) {
    const ex = await Exam.create({
      code: faker.string.alphanumeric(6).toUpperCase(),
      name: faker.commerce.productName(),
      method: faker.word.words({ count: 3 }),
      specimenType: faker.helpers.arrayElement(['SANGRE', 'SUERO', 'PLASMA', 'ORINA', 'SALIVA', 'HECES', 'TEJIDO', 'OTRA']),
      processingTimeMin: faker.number.int({ min: 10, max: 1440 }),
      status: 'ACTIVE',
      priceBase: faker.number.int({ min: 5, max: 200 }),
    } as any);
    exams.push(ex);
  }

  // Parameters (for some exams)
  const parameters: Parameter[] = [];
  for (const ex of exams.slice(0, 10)) {
    for (let i = 0; i < 3; i++) {
      const pr = await Parameter.create({
        examenId: ex.id,
        code: faker.string.alphanumeric(5).toUpperCase(),
        name: faker.word.words({ count: 2 }),
        unit: faker.helpers.arrayElement(['mg/dL', 'g/dL', '%', 'IU/L', 'mmol/L']),
        refMin: faker.number.float({ min: 0.1, max: 10, fractionDigits: 2 }),
        refMax: faker.number.float({ min: 10.1, max: 200, fractionDigits: 2 }),
        typeValue: 'NUMERICO',
        decimals: 2,
        status: 'ACTIVE',
      } as any);
      parameters.push(pr);
    }
  }

  // Panels and PanelItems
  const panels: Panel[] = [];
  for (let i = 0; i < 5; i++) {
    const pa = await Panel.create({
      name: `Panel ${faker.word.words({ count: 2 })}`,
      description: faker.lorem.sentence(),
      status: 'ACTIVE',
    } as any);
    panels.push(pa);

    // add items
    for (let j = 0; j < 4; j++) {
      await PanelItem.create({
        panelId: pa.id,
        kind: 'EXAM',
        examId: faker.helpers.arrayElement(exams).id,
        required: faker.datatype.boolean(),
        order: j + 1,
        status: 'ACTIVE',
      } as any);
    }
  }

  // Orders
  const orders: Order[] = [];
  for (let i = 0; i < 40; i++) {
    const patient = faker.helpers.arrayElement(patients);
    const patientInsuranceId = patientInsuranceMap.get(patient.id);

    const ord = await Order.create({
      orderDate: faker.date.recent({ days: 30 }),
      state: 'CREADA',
      priority: faker.helpers.arrayElement(['RUTINA', 'URGENTE']),
      patientId: patient.id,
      doctorId: faker.helpers.arrayElement(doctors).id,
      insuranceId: patientInsuranceId ?? faker.helpers.arrayElement(insurances).id,
      netTotal: 0,
      observations: faker.lorem.sentence(),
      status: 'ACTIVE',
    } as any);
    orders.push(ord);

    const itemCount = faker.number.int({ min: 1, max: 5 });
    let orderTotal = 0;
    for (let k = 0; k < itemCount; k++) {
      const ex = faker.helpers.arrayElement(exams);
      const price = faker.number.int({ min: 5, max: 150 });
      await OrderItem.create({
        orderId: ord.id,
        examId: ex.id,
        code: ex.code,
        name: ex.name,
        price: price,
        state: 'PENDIENTE',
        status: 'ACTIVE',
      } as any);
      orderTotal += price;
    }
    ord.netTotal = orderTotal;
    await ord.save();
  }

  // Samples and Results
  const samples: Sample[] = [];
  for (const ord of orders.slice(0, 30)) {
    const sm = await Sample.create({
      orderId: ord.id,
      type: faker.helpers.arrayElement(['SANGRE', 'ORINA', 'SALIVA', 'TEJIDO', 'LCR']),
      barcode: faker.string.alphanumeric(10),
      drawDate: faker.date.recent({ days: 10 }),
      state: 'RECOLECTADA',
      observations: faker.lorem.sentence(),
      status: 'ACTIVE',
    } as any);
    samples.push(sm);

    // create some results for the sample from the order items
    const items = await OrderItem.findAll({ where: { orderId: ord.id } });
    for (const it of items) {
      // pick a parameter if exists for the exam
      const pr = parameters.find((p) => p.examenId === it.examId) || undefined;
      await Result.create({
        orderId: ord.id,
        sampleId: sm.id,
        examId: it.examId,
        parameterId: pr ? pr.id : parameters[0]?.id ?? 1,
        numValue: pr
          ? faker.number.float({
            min: Math.min(pr.refMin ?? 0, pr.refMax ?? 100),
            max: Math.max(pr.refMin ?? 0, pr.refMax ?? 100),
          })
          : undefined,
        textValue: pr ? null : faker.lorem.word(),
        outRange: faker.datatype.boolean(),
        dateResult: faker.date.recent({ days: 5 }),
        validatedForId: faker.helpers.arrayElement(doctors).id,
        validatedFor: faker.person.fullName(),
        method: it.name,
        units: pr?.unit ?? null,
        comment: faker.lorem.sentence(),
        resultState: 'PENDIENTE',
        status: 'ACTIVE',
      } as any);
    }
  }

  console.log('Fake data created successfully');
}

createFakeData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error creating fake data:', err);
    process.exit(1);
  });
