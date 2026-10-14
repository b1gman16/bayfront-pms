-- Run AFTER prisma migrate. Rules Prisma cannot express.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Reservation" ADD CONSTRAINT no_double_booking
  EXCLUDE USING gist ("roomId" WITH =, daterange("checkIn","checkOut") WITH &&)
  WHERE ("roomId" IS NOT NULL AND status IN ('PENDING','CONFIRMED','CHECKED_IN'));

ALTER TABLE "Reservation" ADD CONSTRAINT valid_dates CHECK ("checkOut" > "checkIn");
ALTER TABLE "Payment" ADD CONSTRAINT positive_amount CHECK (amount > 0);
ALTER TABLE "FolioItem" ADD CONSTRAINT positive_qty CHECK (qty > 0);

CREATE OR REPLACE FUNCTION audit_immutable() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'audit log is append-only'; END $$ LANGUAGE plpgsql;
CREATE TRIGGER audit_no_update BEFORE UPDATE OR DELETE ON "AuditLog"
  FOR EACH ROW EXECUTE FUNCTION audit_immutable();
