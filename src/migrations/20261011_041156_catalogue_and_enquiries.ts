import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_enquiries_status" AS ENUM('new', 'contacted', 'negotiating', 'confirmed', 'completed', 'lost');
  CREATE TYPE "public"."enum_packages_sections_items_premium" AS ENUM('inherit', 'standard', 'premium');
  CREATE TYPE "public"."enum_packages_sections_items_default_selected" AS ENUM('inherit', 'yes', 'no');
  CREATE TYPE "public"."enum_packages_diet" AS ENUM('veg', 'non-veg', 'jain', 'mixed');
  CREATE TYPE "public"."enum_menu_items_diet" AS ENUM('veg', 'non-veg', 'jain');
  CREATE TYPE "public"."enum_menu_items_spice_level" AS ENUM('0', '1', '2', '3');
  CREATE TYPE "public"."enum_add_ons_pricing_type" AS ENUM('per_plate', 'flat');
  CREATE TYPE "public"."enum_add_ons_category" AS ENUM('live-counter', 'beverages', 'service-staff', 'decor', 'transport', 'banana-leaf', 'desserts', 'other');
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference_id" varchar NOT NULL,
  	"status" "enum_enquiries_status" DEFAULT 'new' NOT NULL,
  	"access_token" varchar NOT NULL,
  	"customer_name" varchar NOT NULL,
  	"phone_e164" varchar NOT NULL,
  	"email" varchar,
  	"consent" boolean DEFAULT false NOT NULL,
  	"consent_at" timestamp(3) with time zone,
  	"event_type_id" integer,
  	"event_date" timestamp(3) with time zone,
  	"guest_count" numeric,
  	"area" varchar,
  	"notes" varchar,
  	"package_id" integer,
  	"estimated_total" numeric,
  	"snapshot" jsonb,
  	"source_utm_source" varchar,
  	"source_utm_medium" varchar,
  	"source_utm_campaign" varchar,
  	"source_utm_term" varchar,
  	"source_utm_content" varchar,
  	"source_referrer" varchar,
  	"source_landing_path" varchar,
  	"assigned_to_id" integer,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "packages_price_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"min_guests" numeric NOT NULL,
  	"max_guests" numeric NOT NULL,
  	"price_per_plate" numeric NOT NULL
  );
  
  CREATE TABLE "packages_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"menu_item_id" integer NOT NULL,
  	"premium" "enum_packages_sections_items_premium" DEFAULT 'inherit',
  	"surcharge_per_plate" numeric,
  	"default_selected" "enum_packages_sections_items_default_selected" DEFAULT 'inherit'
  );
  
  CREATE TABLE "packages_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"rule_min" numeric DEFAULT 1 NOT NULL,
  	"rule_max" numeric DEFAULT 1 NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "packages_add_ons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"add_on_id" integer NOT NULL,
  	"price_override" numeric
  );
  
  CREATE TABLE "packages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"diet" "enum_packages_diet" NOT NULL,
  	"short_description" varchar NOT NULL,
  	"description" jsonb,
  	"min_guests" numeric NOT NULL,
  	"max_guests" numeric NOT NULL,
  	"cost_price_per_plate" numeric,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"slug" varchar NOT NULL,
  	"vendor_id" integer,
  	"published" boolean DEFAULT false,
  	"featured" boolean DEFAULT false,
  	"popularity" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "packages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"event_types_id" integer,
  	"cuisines_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "menu_items" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"diet" "enum_menu_items_diet" DEFAULT 'veg' NOT NULL,
  	"spice_level" "enum_menu_items_spice_level" DEFAULT '1',
  	"cuisine_id" integer,
  	"image_id" integer,
  	"is_premium" boolean DEFAULT false,
  	"surcharge_per_plate" numeric DEFAULT 0,
  	"default_selected" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "add_ons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"image_id" integer,
  	"pricing_type" "enum_add_ons_pricing_type" DEFAULT 'per_plate' NOT NULL,
  	"price" numeric NOT NULL,
  	"category" "enum_add_ons_category" DEFAULT 'other' NOT NULL,
  	"is_global" boolean DEFAULT false,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "event_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"tagline" varchar,
  	"description" varchar,
  	"hero_image_id" integer,
  	"display_order" numeric DEFAULT 100,
  	"slug" varchar NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cuisines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"display_order" numeric DEFAULT 100,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "vendors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"contact_person" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"notes" varchar,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enquiry_counters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"period" varchar NOT NULL,
  	"value" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_why_choose_us" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"occasion" varchar,
  	"area" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar DEFAULT 'Event catering · Bengaluru',
  	"hero_headline" varchar DEFAULT 'Every occasion, served in gold.',
  	"hero_subheadline" varchar DEFAULT 'From Gruhapravesha breakfasts to wedding receptions for a thousand — curated menus you can shape plate by plate, with a live price as you go.',
  	"final_cta_headline" varchar DEFAULT 'Let’s plan your menu together.',
  	"final_cta_body" varchar DEFAULT 'Call, WhatsApp or send an enquiry — we reply within one business day.',
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"pricing_disclaimer" varchar DEFAULT 'Indicative estimate — final price confirmed on call.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "packages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "menu_items_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "add_ons_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_types_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cuisines_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "vendors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiry_counters_id" integer;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_event_type_id_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "packages_price_tiers" ADD CONSTRAINT "packages_price_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_sections_items" ADD CONSTRAINT "packages_sections_items_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "packages_sections_items" ADD CONSTRAINT "packages_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packages_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_sections" ADD CONSTRAINT "packages_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_add_ons" ADD CONSTRAINT "packages_add_ons_add_on_id_add_ons_id_fk" FOREIGN KEY ("add_on_id") REFERENCES "public"."add_ons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "packages_add_ons" ADD CONSTRAINT "packages_add_ons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages" ADD CONSTRAINT "packages_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "packages" ADD CONSTRAINT "packages_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "packages_rels" ADD CONSTRAINT "packages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_rels" ADD CONSTRAINT "packages_rels_event_types_fk" FOREIGN KEY ("event_types_id") REFERENCES "public"."event_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_rels" ADD CONSTRAINT "packages_rels_cuisines_fk" FOREIGN KEY ("cuisines_id") REFERENCES "public"."cuisines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "packages_rels" ADD CONSTRAINT "packages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_cuisine_id_cuisines_id_fk" FOREIGN KEY ("cuisine_id") REFERENCES "public"."cuisines"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "add_ons" ADD CONSTRAINT "add_ons_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_types" ADD CONSTRAINT "event_types_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_types" ADD CONSTRAINT "event_types_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_why_choose_us" ADD CONSTRAINT "site_settings_why_choose_us_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_faq" ADD CONSTRAINT "site_settings_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_testimonials" ADD CONSTRAINT "site_settings_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "enquiries_reference_id_idx" ON "enquiries" USING btree ("reference_id");
  CREATE INDEX "enquiries_status_idx" ON "enquiries" USING btree ("status");
  CREATE INDEX "enquiries_phone_e164_idx" ON "enquiries" USING btree ("phone_e164");
  CREATE INDEX "enquiries_event_type_idx" ON "enquiries" USING btree ("event_type_id");
  CREATE INDEX "enquiries_event_date_idx" ON "enquiries" USING btree ("event_date");
  CREATE INDEX "enquiries_package_idx" ON "enquiries" USING btree ("package_id");
  CREATE INDEX "enquiries_assigned_to_idx" ON "enquiries" USING btree ("assigned_to_id");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE INDEX "packages_price_tiers_order_idx" ON "packages_price_tiers" USING btree ("_order");
  CREATE INDEX "packages_price_tiers_parent_id_idx" ON "packages_price_tiers" USING btree ("_parent_id");
  CREATE INDEX "packages_sections_items_order_idx" ON "packages_sections_items" USING btree ("_order");
  CREATE INDEX "packages_sections_items_parent_id_idx" ON "packages_sections_items" USING btree ("_parent_id");
  CREATE INDEX "packages_sections_items_menu_item_idx" ON "packages_sections_items" USING btree ("menu_item_id");
  CREATE INDEX "packages_sections_order_idx" ON "packages_sections" USING btree ("_order");
  CREATE INDEX "packages_sections_parent_id_idx" ON "packages_sections" USING btree ("_parent_id");
  CREATE INDEX "packages_add_ons_order_idx" ON "packages_add_ons" USING btree ("_order");
  CREATE INDEX "packages_add_ons_parent_id_idx" ON "packages_add_ons" USING btree ("_parent_id");
  CREATE INDEX "packages_add_ons_add_on_idx" ON "packages_add_ons" USING btree ("add_on_id");
  CREATE INDEX "packages_seo_seo_image_idx" ON "packages" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "packages_slug_idx" ON "packages" USING btree ("slug");
  CREATE INDEX "packages_vendor_idx" ON "packages" USING btree ("vendor_id");
  CREATE INDEX "packages_published_idx" ON "packages" USING btree ("published");
  CREATE INDEX "packages_featured_idx" ON "packages" USING btree ("featured");
  CREATE INDEX "packages_updated_at_idx" ON "packages" USING btree ("updated_at");
  CREATE INDEX "packages_created_at_idx" ON "packages" USING btree ("created_at");
  CREATE INDEX "packages_rels_order_idx" ON "packages_rels" USING btree ("order");
  CREATE INDEX "packages_rels_parent_idx" ON "packages_rels" USING btree ("parent_id");
  CREATE INDEX "packages_rels_path_idx" ON "packages_rels" USING btree ("path");
  CREATE INDEX "packages_rels_event_types_id_idx" ON "packages_rels" USING btree ("event_types_id");
  CREATE INDEX "packages_rels_cuisines_id_idx" ON "packages_rels" USING btree ("cuisines_id");
  CREATE INDEX "packages_rels_media_id_idx" ON "packages_rels" USING btree ("media_id");
  CREATE INDEX "menu_items_cuisine_idx" ON "menu_items" USING btree ("cuisine_id");
  CREATE INDEX "menu_items_image_idx" ON "menu_items" USING btree ("image_id");
  CREATE INDEX "menu_items_updated_at_idx" ON "menu_items" USING btree ("updated_at");
  CREATE INDEX "menu_items_created_at_idx" ON "menu_items" USING btree ("created_at");
  CREATE INDEX "add_ons_image_idx" ON "add_ons" USING btree ("image_id");
  CREATE INDEX "add_ons_updated_at_idx" ON "add_ons" USING btree ("updated_at");
  CREATE INDEX "add_ons_created_at_idx" ON "add_ons" USING btree ("created_at");
  CREATE INDEX "event_types_hero_image_idx" ON "event_types" USING btree ("hero_image_id");
  CREATE UNIQUE INDEX "event_types_slug_idx" ON "event_types" USING btree ("slug");
  CREATE INDEX "event_types_seo_seo_image_idx" ON "event_types" USING btree ("seo_image_id");
  CREATE INDEX "event_types_updated_at_idx" ON "event_types" USING btree ("updated_at");
  CREATE INDEX "event_types_created_at_idx" ON "event_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "cuisines_slug_idx" ON "cuisines" USING btree ("slug");
  CREATE INDEX "cuisines_updated_at_idx" ON "cuisines" USING btree ("updated_at");
  CREATE INDEX "cuisines_created_at_idx" ON "cuisines" USING btree ("created_at");
  CREATE UNIQUE INDEX "vendors_code_idx" ON "vendors" USING btree ("code");
  CREATE INDEX "vendors_updated_at_idx" ON "vendors" USING btree ("updated_at");
  CREATE INDEX "vendors_created_at_idx" ON "vendors" USING btree ("created_at");
  CREATE UNIQUE INDEX "enquiry_counters_period_idx" ON "enquiry_counters" USING btree ("period");
  CREATE INDEX "enquiry_counters_updated_at_idx" ON "enquiry_counters" USING btree ("updated_at");
  CREATE INDEX "enquiry_counters_created_at_idx" ON "enquiry_counters" USING btree ("created_at");
  CREATE INDEX "site_settings_why_choose_us_order_idx" ON "site_settings_why_choose_us" USING btree ("_order");
  CREATE INDEX "site_settings_why_choose_us_parent_id_idx" ON "site_settings_why_choose_us" USING btree ("_parent_id");
  CREATE INDEX "site_settings_faq_order_idx" ON "site_settings_faq" USING btree ("_order");
  CREATE INDEX "site_settings_faq_parent_id_idx" ON "site_settings_faq" USING btree ("_parent_id");
  CREATE INDEX "site_settings_testimonials_order_idx" ON "site_settings_testimonials" USING btree ("_order");
  CREATE INDEX "site_settings_testimonials_parent_id_idx" ON "site_settings_testimonials" USING btree ("_parent_id");
  CREATE INDEX "site_settings_seo_seo_image_idx" ON "site_settings" USING btree ("seo_image_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_packages_fk" FOREIGN KEY ("packages_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menu_items_fk" FOREIGN KEY ("menu_items_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_add_ons_fk" FOREIGN KEY ("add_ons_id") REFERENCES "public"."add_ons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_types_fk" FOREIGN KEY ("event_types_id") REFERENCES "public"."event_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cuisines_fk" FOREIGN KEY ("cuisines_id") REFERENCES "public"."cuisines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vendors_fk" FOREIGN KEY ("vendors_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiry_counters_fk" FOREIGN KEY ("enquiry_counters_id") REFERENCES "public"."enquiry_counters"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_packages_id_idx" ON "payload_locked_documents_rels" USING btree ("packages_id");
  CREATE INDEX "payload_locked_documents_rels_menu_items_id_idx" ON "payload_locked_documents_rels" USING btree ("menu_items_id");
  CREATE INDEX "payload_locked_documents_rels_add_ons_id_idx" ON "payload_locked_documents_rels" USING btree ("add_ons_id");
  CREATE INDEX "payload_locked_documents_rels_event_types_id_idx" ON "payload_locked_documents_rels" USING btree ("event_types_id");
  CREATE INDEX "payload_locked_documents_rels_cuisines_id_idx" ON "payload_locked_documents_rels" USING btree ("cuisines_id");
  CREATE INDEX "payload_locked_documents_rels_vendors_id_idx" ON "payload_locked_documents_rels" USING btree ("vendors_id");
  CREATE INDEX "payload_locked_documents_rels_enquiry_counters_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiry_counters_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "enquiries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "packages_price_tiers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "packages_sections_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "packages_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "packages_add_ons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "packages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "packages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "menu_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "add_ons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cuisines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "vendors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiry_counters" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_why_choose_us" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "packages_price_tiers" CASCADE;
  DROP TABLE "packages_sections_items" CASCADE;
  DROP TABLE "packages_sections" CASCADE;
  DROP TABLE "packages_add_ons" CASCADE;
  DROP TABLE "packages" CASCADE;
  DROP TABLE "packages_rels" CASCADE;
  DROP TABLE "menu_items" CASCADE;
  DROP TABLE "add_ons" CASCADE;
  DROP TABLE "event_types" CASCADE;
  DROP TABLE "cuisines" CASCADE;
  DROP TABLE "vendors" CASCADE;
  DROP TABLE "enquiry_counters" CASCADE;
  DROP TABLE "site_settings_why_choose_us" CASCADE;
  DROP TABLE "site_settings_faq" CASCADE;
  DROP TABLE "site_settings_testimonials" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_packages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_menu_items_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_add_ons_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_cuisines_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_vendors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiry_counters_fk";
  
  DROP INDEX "payload_locked_documents_rels_enquiries_id_idx";
  DROP INDEX "payload_locked_documents_rels_packages_id_idx";
  DROP INDEX "payload_locked_documents_rels_menu_items_id_idx";
  DROP INDEX "payload_locked_documents_rels_add_ons_id_idx";
  DROP INDEX "payload_locked_documents_rels_event_types_id_idx";
  DROP INDEX "payload_locked_documents_rels_cuisines_id_idx";
  DROP INDEX "payload_locked_documents_rels_vendors_id_idx";
  DROP INDEX "payload_locked_documents_rels_enquiry_counters_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "packages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "menu_items_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "add_ons_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_types_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cuisines_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "vendors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiry_counters_id";
  DROP TYPE "public"."enum_enquiries_status";
  DROP TYPE "public"."enum_packages_sections_items_premium";
  DROP TYPE "public"."enum_packages_sections_items_default_selected";
  DROP TYPE "public"."enum_packages_diet";
  DROP TYPE "public"."enum_menu_items_diet";
  DROP TYPE "public"."enum_menu_items_spice_level";
  DROP TYPE "public"."enum_add_ons_pricing_type";
  DROP TYPE "public"."enum_add_ons_category";`)
}
