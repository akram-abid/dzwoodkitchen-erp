CREATE OR REPLACE FUNCTION public.update_worker_sold_from_payments()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  worker_id_val INT;
  total_earnings FLOAT;
  total_payments FLOAT;
  hourly_rate FLOAT;
  meter_rate FLOAT;
  total_hours FLOAT;
  total_meters FLOAT;
BEGIN
  -- Determine which worker
  IF TG_OP = 'DELETE' THEN
    worker_id_val = OLD."workerId";
  ELSE
    worker_id_val = NEW."workerId";
  END IF;
  
  -- Get worker's rates
  SELECT "hourlyRate", "meterRate" INTO hourly_rate, meter_rate
  FROM workers 
  WHERE id = worker_id_val;
  
  -- Calculate total hours (if hourly)
  SELECT COALESCE(SUM(
    (EXTRACT(HOUR FROM "clockOut"::time) + EXTRACT(MINUTE FROM "clockOut"::time)/60) -
    (EXTRACT(HOUR FROM "clockIn"::time) + EXTRACT(MINUTE FROM "clockIn"::time)/60) +
    "extraHours"
  ), 0) INTO total_hours
  FROM "TimeEntries"
  WHERE "workerId" = worker_id_val;
  
  -- Calculate total meters (if meter-based)
  SELECT COALESCE(SUM(meters), 0) INTO total_meters
  FROM "Assignment"
  WHERE "workerId" = worker_id_val;
  
  -- Calculate total earnings
  total_earnings = COALESCE(total_hours * hourly_rate, 0) + COALESCE(total_meters * meter_rate, 0);
  
  -- Calculate total payments
  SELECT COALESCE(SUM(amount), 0) INTO total_payments
  FROM "WorkersPayments"
  WHERE "workerId" = worker_id_val;
  
  -- Update sold: earnings - payments
  UPDATE workers 
  SET sold = total_earnings - total_payments,
      updated_at = NOW()
  WHERE id = worker_id_val;
  
  RETURN NEW;
END;
$function$
