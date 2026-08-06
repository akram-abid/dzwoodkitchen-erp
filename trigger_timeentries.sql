CREATE OR REPLACE FUNCTION public.update_worker_sold_from_time_entries()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  worker_id_val INT;
  total_hours FLOAT;
  earnings FLOAT;
  hourly_rate FLOAT;
  total_payments FLOAT;
  sold_value FLOAT;
BEGIN
  -- Determine which worker
  IF TG_OP = 'DELETE' THEN
    worker_id_val = OLD."workerId";
  ELSE
    worker_id_val = NEW."workerId";
  END IF;
  
  -- Get the worker's hourly rate
  SELECT "hourlyRate" INTO hourly_rate 
  FROM workers 
  WHERE id = worker_id_val;
  
  IF hourly_rate IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calculate total hours for this worker
  SELECT COALESCE(SUM(
    (EXTRACT(HOUR FROM "clockOut"::time) + EXTRACT(MINUTE FROM "clockOut"::time)/60) -
    (EXTRACT(HOUR FROM "clockIn"::time) + EXTRACT(MINUTE FROM "clockIn"::time)/60) +
    "extraHours"
  ), 0) INTO total_hours
  FROM "TimeEntries"
  WHERE "workerId" = worker_id_val;
  
  -- Calculate earnings
  earnings = total_hours * hourly_rate;
  
  -- Get total payments
  SELECT COALESCE(SUM(amount), 0) INTO total_payments
  FROM "WorkersPayments"
  WHERE "workerId" = worker_id_val;
  
  -- Calculate sold: earnings - payments
  sold_value = earnings - total_payments;
  
  -- Update worker's sold
  UPDATE workers 
  SET sold = sold_value,
      updated_at = NOW()
  WHERE id = worker_id_val;
  
  RETURN NULL;
END;
$function$
