-- ProAspect Demo Data Seed
-- Contractor: Ömer Aga Akbas (hello@zoyare.com)

DO $$
DECLARE
  uid uuid := '1ea86c0c-8b22-4ec9-af54-1c7b2c2a8525';
  c1 uuid; c2 uuid; c3 uuid; c4 uuid;
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
  inv1 uuid; inv2 uuid; inv3 uuid; inv4 uuid;
BEGIN

-- Clients
INSERT INTO clients (contractor_id, name_i18n, contact_name, contact_email, billing_email) VALUES
  (uid, '{"nl":"TechVentures B.V.","en":"TechVentures B.V.","tr":"TechVentures B.V."}', 'Jan de Vries', 'jan@techventures.nl', 'facturatie@techventures.nl'),
  (uid, '{"nl":"Bloem & Partners","en":"Bloem & Partners","tr":"Bloem & Partners"}', 'Lisa Bloem', 'lisa@bloemenpartners.nl', 'administratie@bloemenpartners.nl'),
  (uid, '{"nl":"GreenEnergy Solutions","en":"GreenEnergy Solutions","tr":"GreenEnergy Solutions"}', 'Mark Groen', 'mark@greenenergy.nl', 'billing@greenenergy.nl'),
  (uid, '{"nl":"De Digitale Winkel","en":"The Digital Shop","tr":"Dijital Dükkan"}', 'Sophie van Dam', 'sophie@dedigitalewinkel.nl', 'boekhouding@dedigitalewinkel.nl');

SELECT id INTO c1 FROM clients WHERE contractor_id = uid AND name_i18n->>'nl' = 'TechVentures B.V.' LIMIT 1;
SELECT id INTO c2 FROM clients WHERE contractor_id = uid AND name_i18n->>'nl' = 'Bloem & Partners' LIMIT 1;
SELECT id INTO c3 FROM clients WHERE contractor_id = uid AND name_i18n->>'nl' = 'GreenEnergy Solutions' LIMIT 1;
SELECT id INTO c4 FROM clients WHERE contractor_id = uid AND name_i18n->>'nl' = 'De Digitale Winkel' LIMIT 1;

-- Projects
INSERT INTO projects (id, contractor_id, client_id, name_i18n, description_i18n, code, hourly_rate) VALUES
  (gen_random_uuid(), uid, c1, '{"nl":"Website Redesign","en":"Website Redesign","tr":"Web Sitesi Yeniden Tasarımı"}', '{"nl":"Volledig herontwerp van de bedrijfswebsite","en":"Complete redesign of the company website","tr":"Şirket web sitesinin tam yeniden tasarımı"}', 'TV-WEB', 8500),
  (gen_random_uuid(), uid, c1, '{"nl":"API Integratie","en":"API Integration","tr":"API Entegrasyonu"}', '{"nl":"REST API ontwikkeling voor mobiele app","en":"REST API development for mobile app","tr":"Mobil uygulama için REST API geliştirme"}', 'TV-API', 9500),
  (gen_random_uuid(), uid, c2, '{"nl":"Boekhoudsysteem","en":"Accounting System","tr":"Muhasebe Sistemi"}', '{"nl":"Op maat gemaakt boekhoudsysteem","en":"Custom accounting system","tr":"Özel muhasebe sistemi"}', 'BP-BOEK', 8500),
  (gen_random_uuid(), uid, c3, '{"nl":"Dashboard Ontwikkeling","en":"Dashboard Development","tr":"Gösterge Paneli Geliştirme"}', '{"nl":"Realtime energie monitoring dashboard","en":"Realtime energy monitoring dashboard","tr":"Gerçek zamanlı enerji izleme panosu"}', 'GE-DASH', 9000),
  (gen_random_uuid(), uid, c4, '{"nl":"Webshop Platform","en":"Webshop Platform","tr":"Web Mağaza Platformu"}', '{"nl":"E-commerce platform ontwikkeling","en":"E-commerce platform development","tr":"E-ticaret platform geliştirme"}', 'DW-SHOP', 7500);

SELECT id INTO p1 FROM projects WHERE contractor_id = uid AND code = 'TV-WEB';
SELECT id INTO p2 FROM projects WHERE contractor_id = uid AND code = 'TV-API';
SELECT id INTO p3 FROM projects WHERE contractor_id = uid AND code = 'BP-BOEK';
SELECT id INTO p4 FROM projects WHERE contractor_id = uid AND code = 'GE-DASH';
SELECT id INTO p5 FROM projects WHERE contractor_id = uid AND code = 'DW-SHOP';

-- Time Entries (last 30 days, realistic pattern)
INSERT INTO time_entries (contractor_id, project_id, date, start_time, end_time, hours, description, status, submitted_at, approved_at) VALUES
  -- Week 1 (recent)
  (uid, p1, CURRENT_DATE - 1, '09:00', '12:30', 3.5, 'Homepage hero sectie en navigatie', 'APPROVED', now() - interval '1 day', now()),
  (uid, p1, CURRENT_DATE - 1, '13:30', '17:00', 3.5, 'Responsive design implementatie', 'APPROVED', now() - interval '1 day', now()),
  (uid, p2, CURRENT_DATE - 2, '09:00', '12:00', 3, 'Authentication endpoints', 'APPROVED', now() - interval '2 days', now()),
  (uid, p2, CURRENT_DATE - 2, '13:00', '17:30', 4.5, 'User CRUD API + tests', 'APPROVED', now() - interval '2 days', now()),
  (uid, p4, CURRENT_DATE - 3, '09:00', '13:00', 4, 'Grafiek componenten bouwen', 'SUBMITTED', now() - interval '3 days', null),
  (uid, p4, CURRENT_DATE - 3, '14:00', '17:00', 3, 'WebSocket realtime data feed', 'SUBMITTED', now() - interval '3 days', null),
  (uid, p3, CURRENT_DATE - 4, '09:30', '12:30', 3, 'Factuurmodule database schema', 'APPROVED', now() - interval '4 days', now()),
  (uid, p3, CURRENT_DATE - 4, '13:30', '17:00', 3.5, 'BTW-berekening logica', 'APPROVED', now() - interval '4 days', now()),
  (uid, p5, CURRENT_DATE - 5, '09:00', '12:00', 3, 'Productcatalogus frontend', 'APPROVED', now() - interval '5 days', now()),
  (uid, p5, CURRENT_DATE - 5, '13:00', '16:30', 3.5, 'Winkelwagen functionaliteit', 'APPROVED', now() - interval '5 days', now()),

  -- Week 2
  (uid, p1, CURRENT_DATE - 8, '09:00', '12:00', 3, 'Over ons pagina', 'APPROVED', now() - interval '8 days', now()),
  (uid, p1, CURRENT_DATE - 8, '13:00', '17:00', 4, 'Contact formulier + validatie', 'APPROVED', now() - interval '8 days', now()),
  (uid, p2, CURRENT_DATE - 9, '09:00', '17:00', 7, 'Order management endpoints', 'APPROVED', now() - interval '9 days', now()),
  (uid, p4, CURRENT_DATE - 10, '09:00', '12:30', 3.5, 'Energie verbruik overzicht', 'APPROVED', now() - interval '10 days', now()),
  (uid, p4, CURRENT_DATE - 10, '13:30', '17:00', 3.5, 'Export naar PDF/CSV', 'APPROVED', now() - interval '10 days', now()),
  (uid, p3, CURRENT_DATE - 11, '09:00', '13:00', 4, 'Klantbeheer module', 'APPROVED', now() - interval '11 days', now()),
  (uid, p5, CURRENT_DATE - 12, '09:00', '12:00', 3, 'Checkout flow', 'APPROVED', now() - interval '12 days', now()),
  (uid, p5, CURRENT_DATE - 12, '13:00', '17:00', 4, 'Betaalintegratie Mollie', 'APPROVED', now() - interval '12 days', now()),

  -- Week 3
  (uid, p1, CURRENT_DATE - 15, '09:00', '17:00', 7, 'Wireframes uitwerken naar code', 'APPROVED', now() - interval '15 days', now()),
  (uid, p2, CURRENT_DATE - 16, '09:00', '12:00', 3, 'API documentatie', 'APPROVED', now() - interval '16 days', now()),
  (uid, p2, CURRENT_DATE - 16, '13:00', '16:00', 3, 'Rate limiting + caching', 'APPROVED', now() - interval '16 days', now()),
  (uid, p3, CURRENT_DATE - 17, '09:00', '17:00', 7, 'Rapportage module', 'APPROVED', now() - interval '17 days', now()),
  (uid, p4, CURRENT_DATE - 18, '10:00', '16:00', 5, 'Gebruikersbeheer dashboard', 'APPROVED', now() - interval '18 days', now()),
  (uid, p5, CURRENT_DATE - 19, '09:00', '12:00', 3, 'Zoekfunctionaliteit', 'APPROVED', now() - interval '19 days', now()),

  -- Week 4
  (uid, p1, CURRENT_DATE - 22, '09:00', '13:00', 4, 'Project kickoff + planning', 'APPROVED', now() - interval '22 days', now()),
  (uid, p2, CURRENT_DATE - 23, '09:00', '17:00', 7, 'Database design + setup', 'APPROVED', now() - interval '23 days', now()),
  (uid, p3, CURRENT_DATE - 24, '09:00', '12:00', 3, 'Requirements analyse', 'APPROVED', now() - interval '24 days', now()),
  (uid, p5, CURRENT_DATE - 25, '09:00', '17:00', 7, 'Project setup + CI/CD', 'APPROVED', now() - interval '25 days', now()),

  -- Drafts (today)
  (uid, p1, CURRENT_DATE, '09:00', null, 2, 'Footer en sitemap pagina', 'DRAFT', null, null),
  (uid, p4, CURRENT_DATE, '11:00', null, 1.5, 'Bug fix: grafiek rendering', 'DRAFT', null, null);

-- Invoices
INSERT INTO invoices (id, contractor_id, client_id, invoice_number, status, issue_date, due_date, subtotal_cents, vat_rate, vat_amount_cents, total_cents, notes, sent_at, paid_at) VALUES
  (gen_random_uuid(), uid, c1, 'INV-2026-0001', 'PAID', CURRENT_DATE - 28, CURRENT_DATE - 14, 178500, 21, 37485, 215985, 'Website Redesign - Fase 1', now() - interval '28 days', now() - interval '10 days'),
  (gen_random_uuid(), uid, c2, 'INV-2026-0002', 'PAID', CURRENT_DATE - 21, CURRENT_DATE - 7, 127500, 21, 26775, 154275, 'Boekhoudsysteem - Sprint 1', now() - interval '21 days', now() - interval '5 days'),
  (gen_random_uuid(), uid, c3, 'INV-2026-0003', 'SENT', CURRENT_DATE - 7, CURRENT_DATE + 23, 144000, 21, 30240, 174240, 'Dashboard Ontwikkeling - Mei', now() - interval '7 days', null),
  (gen_random_uuid(), uid, c4, 'INV-2026-0004', 'DRAFT', CURRENT_DATE, CURRENT_DATE + 30, 157500, 21, 33075, 190575, 'Webshop Platform - Sprint 2', null, null);

SELECT id INTO inv1 FROM invoices WHERE invoice_number = 'INV-2026-0001';
SELECT id INTO inv2 FROM invoices WHERE invoice_number = 'INV-2026-0002';
SELECT id INTO inv3 FROM invoices WHERE invoice_number = 'INV-2026-0003';
SELECT id INTO inv4 FROM invoices WHERE invoice_number = 'INV-2026-0004';

-- Invoice Line Items
INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price_cents, total_cents) VALUES
  (inv1, 'Website Redesign - Ontwerp & Development', 21, 8500, 178500),
  (inv2, 'Boekhoudsysteem - Development Sprint 1', 15, 8500, 127500),
  (inv3, 'Dashboard - Grafiek componenten', 7, 9000, 63000),
  (inv3, 'Dashboard - Realtime data feed', 6, 9000, 54000),
  (inv3, 'Dashboard - Export functionaliteit', 3, 9000, 27000),
  (inv4, 'Webshop - Checkout flow', 7, 7500, 52500),
  (inv4, 'Webshop - Betaalintegratie', 4, 7500, 30000),
  (inv4, 'Webshop - Productcatalogus', 10, 7500, 75000);

-- Expenses
INSERT INTO expenses (contractor_id, project_id, date, amount_cents, category, description, vat_deductible, vat_amount_cents) VALUES
  (uid, null, CURRENT_DATE - 2, 4999, 'Software', 'GitHub Pro - maandelijks', true, 1050),
  (uid, null, CURRENT_DATE - 5, 2500, 'Software', 'Supabase Pro plan', true, 525),
  (uid, p1, CURRENT_DATE - 10, 7900, 'Software', 'Figma licentie - maandelijks', true, 1659),
  (uid, null, CURRENT_DATE - 12, 3500, 'Kantoor', 'Koffie & supplies coworkspace', true, 735),
  (uid, p5, CURRENT_DATE - 15, 15000, 'Software', 'Mollie test account setup', true, 3150),
  (uid, null, CURRENT_DATE - 20, 5999, 'Hardware', 'USB-C hub voor laptop', true, 1260),
  (uid, null, CURRENT_DATE - 25, 12500, 'Reiskosten', 'Trein naar klant Amsterdam', true, 0),
  (uid, null, CURRENT_DATE - 28, 24900, 'Software', 'JetBrains All Products jaarlijks', true, 5229);

-- Update admin_settings with next invoice number
UPDATE admin_settings SET next_invoice_number = 5, invoice_prefix = 'INV' WHERE contractor_id = uid;

-- Notifications
INSERT INTO notifications (user_id, title, message, type, read, action_url) VALUES
  (uid, 'Factuur betaald', 'TechVentures B.V. heeft INV-2026-0001 betaald (€2.159,85)', 'PAYMENT', true, '/dashboard/invoices'),
  (uid, 'Factuur betaald', 'Bloem & Partners heeft INV-2026-0002 betaald (€1.542,75)', 'PAYMENT', true, '/dashboard/invoices'),
  (uid, 'Factuur bekeken', 'GreenEnergy Solutions heeft INV-2026-0003 bekeken', 'INVOICE', false, '/dashboard/invoices'),
  (uid, 'Uren goedgekeurd', '14 uur goedgekeurd voor TechVentures B.V.', 'APPROVAL', false, '/dashboard/time'),
  (uid, 'Welkom bij ProAspect', 'Je account is succesvol aangemaakt. Veel succes!', 'SYSTEM', true, '/dashboard');

END $$;
