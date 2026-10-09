/* eslint-disable no-console */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Customer from '../models/Customer.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import Estimate from '../models/Estimate.js';
import Vendor from '../models/Vendor.js';
import InventoryItem from '../models/InventoryItem.js';
import Invoice from '../models/Invoice.js';
import Design from '../models/Design.js';
import Task from '../models/Task.js';
import { config } from '../config/env.js';

const DEMO_EMAIL = 'demo@buildora.dev';
const DEMO_PASSWORD = 'BuildoraDemo2026';

const seed = async () => {
  await mongoose.connect(config.mongoUri);
  console.log(`Connected: ${mongoose.connection.name}`);

  // Only re-seed the demo org; other orgs are untouched.
  const demoUser = await User.findOne({ email: DEMO_EMAIL });
  let orgId = demoUser?.organization;

  if (demoUser) {
    const existingData = await Customer.countDocuments({ organization: orgId });
    if (existingData > 0) {
      console.log('Demo organization already seeded — nothing to do.');
      console.log(`Login → ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
      process.exit(0);
    }
  }

  const org = await Organization.create({
    name: 'Buildora Demo Studio',
    contactEmail: DEMO_EMAIL,
    currency: 'INR',
  });
  orgId = org._id;

  const users = await Promise.all([
    User.create({
      organization: orgId, name: 'Demo Admin', email: DEMO_EMAIL, password: DEMO_PASSWORD, role: 'admin',
    }),
    User.create({
      organization: orgId, name: 'Priya Sharma', email: 'sales@buildora.dev', password: `${DEMO_PASSWORD}#S`, role: 'sales_manager',
    }),
    User.create({
      organization: orgId, name: 'Arjun Mehta', email: 'pm@buildora.dev', password: `${DEMO_PASSWORD}#P`, role: 'project_manager',
    }),
    User.create({
      organization: orgId, name: 'Kavya Rao', email: 'designer@buildora.dev', password: `${DEMO_PASSWORD}#D`, role: 'designer',
    }),
    User.create({
      organization: orgId, name: 'Finance Lead', email: 'finance@buildora.dev', password: `${DEMO_PASSWORD}#F`, role: 'finance_manager',
    }),
  ]);
  const [admin, sales, pm, designer, finance] = users;

  const customers = await Customer.create([
    { organization: orgId, name: 'Sharath Reddy', email: 'sharath@example.com', phone: '+91 98450 11223', city: 'Bengaluru', createdBy: admin },
    { organization: orgId, name: 'Anjali Nair', email: 'anjali@example.com', phone: '+91 99400 55667', city: 'Kochi', createdBy: admin },
    { organization: orgId, name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 98200 33445', city: 'Mumbai', createdBy: admin },
  ]);

  const leads = await Lead.create([
    { organization: orgId, name: 'Rahul Verma', phone: '+91 98110 45678', city: 'Delhi', source: 'Website', interest: '3BHK full interior', estimateValue: 2400000, status: 'new', priority: 'high', assignedTo: sales, createdBy: admin },
    { organization: orgId, name: 'Sneha Iyer', email: 'sneha@example.com', phone: '+91 97456 12345', city: 'Chennai', source: 'Referral', interest: 'Villa construction', estimateValue: 8500000, status: 'contacted', priority: 'high', assignedTo: sales, createdBy: admin },
    { organization: orgId, name: 'Manish Gupta', phone: '+91 99100 78901', city: 'Noida', source: 'Instagram', interest: 'Office interior', estimateValue: 1600000, status: 'qualified', priority: 'medium', assignedTo: sales, createdBy: admin },
  ]);

  const projects = await Project.create([
    {
      organization: orgId, code: 'PRJ-0001', name: 'Whitefield 3BHK Interior', type: 'interior',
      customer: customers[0]._id, manager: pm._id, status: 'in_progress', city: 'Bengaluru',
      startDate: new Date('2026-08-01'), targetDate: new Date('2026-11-15'),
      budget: { allocated: 2400000, spent: 1350000 }, progress: 55, createdBy: admin,
      description: 'Turnkey 3BHK interior with modular kitchen and wardrobes.',
    },
    {
      organization: orgId, code: 'PRJ-0002', name: 'Kochi Villa Construction', type: 'construction',
      customer: customers[1]._id, manager: pm._id, status: 'design', city: 'Kochi',
      startDate: new Date('2026-09-15'), targetDate: new Date('2027-06-30'),
      budget: { allocated: 8500000, spent: 700000 }, progress: 15, createdBy: admin,
    },
    {
      organization: orgId, code: 'PRJ-0003', name: 'Powai Office Fitout', type: 'interior',
      customer: customers[2]._id, manager: pm._id, status: 'in_progress', city: 'Mumbai',
      startDate: new Date('2026-07-20'), targetDate: new Date('2026-10-30'),
      budget: { allocated: 1600000, spent: 1520000 }, progress: 85, createdBy: admin,
    },
  ]);

  await Task.create([
    { organization: orgId, project: projects[0]._id, title: 'Modular kitchen carpentry', status: 'in_progress', priority: 'high', assignee: pm._id, progress: 60, dueDate: new Date('2026-10-20'), createdBy: admin },
    { organization: orgId, project: projects[0]._id, title: 'False ceiling MEP coordination', status: 'todo', priority: 'medium', progress: 0, dueDate: new Date('2026-10-25'), createdBy: admin },
    { organization: orgId, project: projects[2]._id, title: 'Final snag list & handover', status: 'in_progress', priority: 'high', progress: 40, dueDate: new Date('2026-10-12'), createdBy: admin },
  ]);

  const estimateItems = [
    { description: 'Modular kitchen (acrylic finish)', unit: 'sqft', quantity: 140, rate: 1650, gstPercent: 18 },
    { description: 'Wardrobe — 3 doors', unit: 'nos', quantity: 3, rate: 32000, gstPercent: 18 },
    { description: 'Living room false ceiling', unit: 'sqft', quantity: 210, rate: 165, gstPercent: 18 },
    { description: 'Engineered wood flooring', unit: 'sqft', quantity: 380, rate: 210, gstPercent: 18 },
  ];
  const estTotals = estimateItems.reduce(
    (acc, it) => {
      const line = it.quantity * it.rate;
      const gst = line * (it.gstPercent / 100);
      return { subtotal: acc.subtotal + line, gstTotal: acc.gstTotal + gst };
    },
    { subtotal: 0, gstTotal: 0 }
  );

  await Estimate.create({
    organization: orgId, title: 'Whitefield 3BHK — Full Interior BOQ', project: projects[0]._id, customer: customers[0]._id,
    items: estimateItems, subtotal: estTotals.subtotal, gstTotal: estTotals.gstTotal, total: estTotals.subtotal + estTotals.gstTotal,
    status: 'internal_review', validUntil: new Date('2026-11-30'), createdBy: designer,
  });

  const vendors = await Vendor.create([
    { organization: orgId, name: 'Shakti Plywoods', email: 'sales@shaktiply.in', phone: '+91 99000 12345', categories: ['plywood', 'laminates'], rating: 4.5, createdBy: admin },
    { organization: orgId, name: 'Granite House India', email: 'orders@granitehouse.co', phone: '+91 98450 98765', categories: ['granite', 'quartz'], rating: 4.2, createdBy: admin },
    { organization: orgId, name: 'Lightkraft Studio', email: 'hi@lightkraft.io', phone: '+91 98860 44556', categories: ['lighting'], rating: 4.8, createdBy: admin },
  ]);

  await InventoryItem.create([
    { organization: orgId, sku: 'PLY-19MM-BWP', name: 'BWP Plywood 19mm', category: 'plboards', unit: 'sheet', quantity: 22, reorderLevel: 25, unitPrice: 2450, warehouseLocation: 'Godown A / Rack 3', createdBy: admin, movements: [{ type: 'in', quantity: 30, reason: 'Opening stock', actor: admin }] },
    { organization: orgId, sku: 'HDW-HT-50', name: 'Hettich hinges 110°', category: 'hardware', unit: 'nos', quantity: 240, reorderLevel: 100, unitPrice: 95, createdBy: admin, movements: [{ type: 'in', quantity: 300, reason: 'Opening stock', actor: admin }] },
    { organization: orgId, sku: 'PNT-APEX-PRIM', name: 'Primer — Apex', category: 'paint', unit: 'ltr', quantity: 8, reorderLevel: 20, unitPrice: 240, createdBy: admin, movements: [{ type: 'in', quantity: 20, reason: 'Opening stock', actor: admin }, { type: 'out', quantity: 12, reason: 'Site consumption — PRJ-0001', actor: pm._id }] },
  ]);

  await Invoice.create({
    organization: orgId, number: 'INV-0001', project: projects[0]._id, customer: customers[0]._id,
    milestone: '30% advance', items: [
      { description: 'Project mobilisation advance 30%', quantity: 1, rate: 720000, gstPercent: 18 },
    ],
    subtotal: 720000, gstTotal: 129600, total: 849600, amountPaid: 849600,
    status: 'paid', issueDate: new Date('2026-08-05'), dueDate: new Date('2026-08-20'),
    payments: [{ amount: 849600, mode: 'bank_transfer', recordedBy: finance._id, paidOn: new Date('2026-08-18') }],
    createdBy: finance._id,
  });

  await Invoice.create({
    organization: orgId, number: 'INV-0002', project: projects[0]._id, customer: customers[0]._id,
    milestone: '40% on completion of carpentry', items: [
      { description: 'Stage 2 — carpentry milestone 40%', quantity: 1, rate: 960000, gstPercent: 18 },
    ],
    subtotal: 960000, gstTotal: 172800, total: 1132800, amountPaid: 400000,
    status: 'partially_paid', issueDate: new Date('2026-09-28'), dueDate: new Date('2026-10-05'),
    payments: [{ amount: 400000, mode: 'bank_transfer', recordedBy: finance._id, paidOn: new Date('2026-10-01') }],
    createdBy: finance._id,
  });

  await Invoice.create({
    organization: orgId, number: 'INV-0003', project: projects[2]._id, customer: customers[2]._id,
    milestone: 'Final handover', items: [
      { description: 'Powai office final milestone', quantity: 1, rate: 1300000, gstPercent: 18 },
    ],
    subtotal: 1300000, gstTotal: 234000, total: 1534000, amountPaid: 0,
    status: 'pending', issueDate: new Date('2026-10-01'), dueDate: new Date('2026-10-01'),
    createdBy: finance._id,
  });

  await Design.create({
    organization: orgId, projectId: projects[0]._id, customer: customers[0]._id, title: 'Living + dining concept', room: 'Living',
    scope: 'Warm minimal palette, wood + off-white base, arc false ceiling', status: 'client_approved',
    versions: [
      { version: 1, label: 'Concept A — warm minimal', sentForApproval: true, approvedByClient: true, respondedAt: new Date('2026-08-12'), createdBy: designer },
    ],
    createdBy: designer,
  });

  console.log('──────────────────────────────────────');
  console.log('Seed complete ✔  (demo organization)');
  console.log(`  Organization: Buildora Demo Studio`);
  console.log(`  Admin login : ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log('  Other demo users follow the pattern password#X (sales/pm/designer/finance).');
  console.log('──────────────────────────────────────');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
