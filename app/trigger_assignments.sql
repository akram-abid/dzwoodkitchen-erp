CREATE OR REPLACE FUNCTION public.update_worker_sold_from_assignments()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  total_meters FLOAT;
  earnings FLOAT;
  meter_rate FLOAT;
  total_payments FLOAT;
  worker_id_val INT;
BEGIN
  -- Determine worker ID
  IF TG_OP = 'DELETE' THEN
    worker_id_val = OLD."workerId";
  ELSE
    worker_id_val = NEW."workerId";
  END IF;
  
  -- Get the worker's meter rate
  SELECT "meterRate" INTO meter_rate 
  FROM workers 
  WHERE id = worker_id_val;
  
  IF meter_rate IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calculate total meters for this worker
  SELECT COALESCE(SUM(meters), 0) INTO total_meters
  FROM "Assignment"
  WHERE "workerId" = worker_id_val;
  
  -- Calculate earnings
  earnings = total_meters * meter_rate;
  
  -- Get total payments
  SELECT COALESCE(SUM(amount), 0) INTO total_payments
  FROM "WorkersPayments"
  WHERE "workerId" = worker_id_val;
  
  -- Update sold: earnings - payments
  UPDATE workers 
  SET sold = earnings - total_payments,
      updated_at = NOW()
  WHERE id = worker_id_val;
  
  RETURN NEW;
END;
$function$
