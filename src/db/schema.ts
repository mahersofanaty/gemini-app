import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  numeric, 
  boolean, 
  integer,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';

// ==========================================
// 1. Admin Users (Administrative accounts & sessions)
// ==========================================
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  uid: text('uid').unique(), // Firebase Auth UID or system identifier
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('admin'), // 'superadmin' | 'admin' | 'operator'
  isActive: boolean('is_active').notNull().default(true),
  passwordHash: text('password_hash'), // Salted hash for session authentication
  sessionToken: text('session_token'),
  sessionExpiresAt: timestamp('session_expires_at'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('admin_users_email_idx').on(table.email),
  index('admin_users_session_token_idx').on(table.sessionToken),
]);

// ==========================================
// 2. Customers
// ==========================================
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  salutation: text('salutation'), // 'herr' | 'frau' | 'firma'
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  companyName: text('company_name'),
  email: text('email').notNull(),
  phone: text('phone'),
  street: text('street').notNull(),
  houseNumber: text('house_number').notNull(),
  postalCode: text('postal_code').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull().default('Deutschland'),
  ibanEncrypted: text('iban_encrypted'), // Encrypted at rest
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('customers_email_idx').on(table.email),
  index('customers_name_idx').on(table.lastName, table.firstName),
]);

// ==========================================
// 3. Vehicles
// ==========================================
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  licensePlate: text('license_plate').notNull(), // Normalized (e.g. "D-AB 1234")
  vin: text('vin'), // 17-char FIN/VIN if available
  registrationDistrict: text('registration_district').notNull(),
  zbiIssueDate: text('zbi_issue_date').notNull(), // YYYY-MM-DD
  reservationRequested: boolean('reservation_requested').notNull().default(false),
  reservationDurationMonths: integer('reservation_duration_months'),
  reservationPinEncrypted: text('reservation_pin_encrypted'), // Encrypted PIN
  vehicleType: text('vehicle_type').default('pkw'),
  plateConfiguration: text('plate_configuration').default('standard_two'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('vehicles_license_plate_idx').on(table.licensePlate),
  index('vehicles_district_idx').on(table.registrationDistrict),
]);

// ==========================================
// 4. Orders
// ==========================================
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  publicOrderId: text('public_order_id').notNull().unique(), // e.g. "KFA-2026-000001"
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  status: text('status').notNull().default('pending_payment'), 
  // 'pending_payment' | 'paid' | 'submitted_to_ikfz' | 'erfolgreich_abgemeldet' | 'abgelehnt' | 'storniert' | 'erstattet'
  servicePrice: numeric('service_price', { precision: 10, scale: 2 }).notNull().default('19.90'),
  authorityFee: numeric('authority_fee', { precision: 10, scale: 2 }).notNull().default('2.70'),
  reservationFee: numeric('reservation_fee', { precision: 10, scale: 2 }).notNull().default('0.00'),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('EUR'),
  authorityId: text('authority_id'), // e.g. "DE-BY-MUC"
  ikfzReference: text('ikfz_reference'), // Official authority transaction number (ONLY when confirmed!)
  ikfzStatus: text('ikfz_status'), // 'NOT_SUBMITTED' | 'PENDING' | 'CONFIRMED' | 'MANUAL_REVIEW' | 'REJECTED'
  ikfzOfficialDocument: text('ikfz_official_document'), // Base64 or stored receipt if supplied by authority
  deRegistrationDate: text('de_registration_date'),
  digitalReceiptPath: text('digital_receipt_path'),
  clientIp: text('client_ip'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  paidAt: timestamp('paid_at'),
  completedAt: timestamp('completed_at'),
}, (table) => [
  uniqueIndex('orders_public_id_idx').on(table.publicOrderId),
  index('orders_status_idx').on(table.status),
  index('orders_customer_id_idx').on(table.customerId),
  index('orders_vehicle_id_idx').on(table.vehicleId),
  index('orders_created_at_idx').on(table.createdAt),
]);

// ==========================================
// 5. Security Codes (Strictly Encrypted at Rest & Isolated)
// ==========================================
export const securityCodes = pgTable('security_codes', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  // Ciphertext fields (AES-GCM encrypted, never stored in plain text)
  zbiSecurityCodeEncrypted: text('zbi_security_code_encrypted').notNull(),
  frontPlateSecurityCodeEncrypted: text('front_plate_security_code_encrypted'),
  rearPlateSecurityCodeEncrypted: text('rear_plate_security_code_encrypted'),
  // Masked representations safe for restricted staff verification
  zbiSecurityCodeMasked: text('zbi_security_code_masked').notNull(),
  frontPlateSecurityCodeMasked: text('front_plate_security_code_masked'),
  rearPlateSecurityCodeMasked: text('rear_plate_security_code_masked'),
  singlePlateOnly: boolean('single_plate_only').notNull().default(false),
  scratchedConfirmed: boolean('scratched_confirmed').notNull().default(true),
  encryptionKeyId: text('encryption_key_id').notNull().default('aes-gcm-v1'),
  // GDPR Data Retention & Automatic Deletion policy
  retentionExpiresAt: timestamp('retention_expires_at').notNull(), // Purged 14 days after completion
  isPurged: boolean('is_purged').notNull().default(false),
  purgedAt: timestamp('purged_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('security_codes_order_id_idx').on(table.orderId),
  index('security_codes_retention_idx').on(table.retentionExpiresAt, table.isPurged),
]);

// ==========================================
// 6. Payments
// ==========================================
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  provider: text('provider').notNull(), // 'paypal' | 'klarna' | 'sepa' | 'card' | 'apple_google_pay'
  providerTransactionId: text('provider_transaction_id'),
  status: text('status').notNull().default('pending'), // 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('EUR'),
  paymentDetails: text('payment_details'), // JSON string without sensitive card numbers
  clientIp: text('client_ip'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('payments_order_id_idx').on(table.orderId),
  index('payments_provider_tx_idx').on(table.providerTransactionId),
]);

// ==========================================
// 7. Order Events
// ==========================================
export const orderEvents = pgTable('order_events', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  eventType: text('event_type').notNull(), 
  // 'order_created' | 'payment_authorized' | 'payment_captured' | 'ikfz_submission_started' | 'ikfz_successful' | 'certificate_generated' | 'security_codes_purged'
  previousStatus: text('previous_status'),
  newStatus: text('new_status'),
  description: text('description'),
  actorType: text('actor_type').notNull().default('system'), // 'customer' | 'admin' | 'system'
  actorId: text('actor_id'),
  metadata: text('metadata'), // JSON string, strictly sanitized - NO security codes
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('order_events_order_id_idx').on(table.orderId),
  index('order_events_event_type_idx').on(table.eventType),
]);

// ==========================================
// 8. Email Logs
// ==========================================
export const emailLogs = pgTable('email_logs', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  recipient: text('recipient').notNull(),
  subject: text('subject').notNull(),
  emailType: text('email_type').notNull(), // 'order_confirmation' | 'receipt' | 'deregistration_notice' | 'cancellation'
  status: text('status').notNull().default('queued'), // 'sent' | 'delivered' | 'failed' | 'queued'
  messageId: text('message_id'),
  errorDetails: text('error_details'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
}, (table) => [
  index('email_logs_order_id_idx').on(table.orderId),
  index('email_logs_recipient_idx').on(table.recipient),
]);

// ==========================================
// 9. Refunds
// ==========================================
export const refunds = pgTable('refunds', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  paymentId: integer('payment_id').references(() => payments.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('EUR'),
  reason: text('reason').notNull(),
  adminUserId: integer('admin_user_id').references(() => adminUsers.id),
  status: text('status').notNull().default('requested'), // 'requested' | 'processed' | 'failed'
  providerRefundId: text('provider_refund_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
}, (table) => [
  index('refunds_order_id_idx').on(table.orderId),
  index('refunds_status_idx').on(table.status),
]);

// ==========================================
// 10. Audit Log (Strict Admin & Security Trail)
// ==========================================
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  eventType: text('event_type').notNull(),
  // 'order_viewed' | 'order_updated' | 'admin_login' | 'admin_logout' | 'refund_issued' | 'security_codes_purged' | 'retention_executed' | 'security_codes_revealed' | 'vehicle_data_modified_post_payment'
  orderId: integer('order_id').references(() => orders.id),
  adminUserId: integer('admin_user_id').references(() => adminUsers.id),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent'),
  metadata: text('metadata'), // JSON string with metadata WITHOUT sensitive security-code values
}, (table) => [
  index('audit_logs_order_id_idx').on(table.orderId),
  index('audit_logs_admin_user_id_idx').on(table.adminUserId),
  index('audit_logs_event_type_idx').on(table.eventType),
  index('audit_logs_timestamp_idx').on(table.timestamp),
]);

// ==========================================
// 11. Order Internal Notes (Staff & Admin Notes)
// ==========================================
export const orderNotes = pgTable('order_notes', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  adminUserId: integer('admin_user_id').references(() => adminUsers.id),
  adminName: text('admin_name').notNull(),
  note: text('note').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('order_notes_order_id_idx').on(table.orderId),
]);

// ==========================================
// 12. System Settings
// ==========================================
export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// 13. Zulassungsbehörden (Competent Registration Authorities)
// ==========================================
export const authorities = pgTable('authorities', {
  id: serial('id').primaryKey(),
  authorityId: text('authority_id').notNull().unique(), // e.g. "DE-BY-MUC", "DE-BE-BER"
  name: text('name').notNull(),
  state: text('state').notNull(),
  city: text('city').notNull(),
  postalCodes: text('postal_codes').notNull(), // Comma-separated or JSON string of PLZ
  ikfzEndpoint: text('ikfz_endpoint'), // Documented official i-KfZ API endpoint (null if portal only)
  integrationType: text('integration_type').notNull().default('mock'), // 'mock' | 'production_api' | 'portal_manual' | 'unsupported'
  active: boolean('active').notNull().default(true),
  districtCodes: text('district_codes').notNull(), // Distrct prefixes, e.g. "M", "B", "D", "K", "HH"
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  supportsReservation: boolean('supports_reservation').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('authorities_authority_id_idx').on(table.authorityId),
  index('authorities_state_idx').on(table.state),
  index('authorities_city_idx').on(table.city),
  index('authorities_active_idx').on(table.active),
]);

// ==========================================
// Drizzle Relations
// ==========================================
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  orders: many(orders),
  securityCodes: many(securityCodes),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [orders.vehicleId],
    references: [vehicles.id],
  }),
  securityCodes: many(securityCodes),
  payments: many(payments),
  events: many(orderEvents),
  emailLogs: many(emailLogs),
  refunds: many(refunds),
  auditLogs: many(auditLogs),
}));

export const securityCodesRelations = relations(securityCodes, ({ one }) => ({
  order: one(orders, {
    fields: [securityCodes.orderId],
    references: [orders.id],
  }),
  vehicle: one(vehicles, {
    fields: [securityCodes.vehicleId],
    references: [vehicles.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  refunds: many(refunds),
}));

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  refunds: many(refunds),
  auditLogs: many(auditLogs),
}));
