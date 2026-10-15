-- Freeze tax/fee rules on each bill at check-out.
ALTER TABLE "Folio" ADD COLUMN "rulesSnapshot" JSONB;

-- Bills that are already closed keep the rules that are switched on today.
UPDATE "Folio"
SET "rulesSnapshot" = (
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name', r."name", 'kind', r."kind"::text, 'type', r."type"::text, 'value', r."value",
    'compound', r."compound", 'active', true, 'sortOrder', r."sortOrder")
    ORDER BY r."sortOrder"), '[]'::jsonb)
  FROM "FeeRule" r WHERE r."active" = true)
WHERE "closedAt" IS NOT NULL;