CREATE OR REPLACE FUNCTION update_worker_sold_from_time_entries()
RETURNS TRIGGER AS $$
DECLARE
  worker_id_var INT;
  total_hours FLOAT;
  earnings FLOAT;
  hourly_rate FLOAT;
  total_payments FLOAT;
BEGIN
  -- Resolve the worker id from OLD on DELETE, NEW otherwise
  IF TG_OP = 'DELETE' THEN
    worker_id_var = OLD."workerId";
  ELSE
    worker_id_var = NEW."workerId";
  END IF;

  -- Get the worker's hourly rate
  SELECT "hourlyRate" INTO hourly_rate 
  FROM workers 
  WHERE id = worker_id_var;
  
  -- Calculate total hours for this worker
  SELECT COALESCE(SUM(
    (EXTRACT(HOUR FROM "clockOut"::time) + EXTRACT(MINUTE FROM "clockOut"::time)/60) -
    (EXTRACT(HOUR FROM "clockIn"::time) + EXTRACT(MINUTE FROM "clockIn"::time)/60) +
    "extraHours"
  ), 0) INTO total_hours
  FROM "TimeEntries"
  WHERE "workerId" = worker_id_var;
  
  -- Calculate earnings
  earnings = total_hours * hourly_rate;
  
  -- Get total payments
  SELECT COALESCE(SUM(amount), 0) INTO total_payments
  FROM "WorkersPayments"
  WHERE "workerId" = worker_id_var;
  
  -- Update sold: earnings - payments
  UPDATE workers 
  SET sold = earnings - total_payments,
      updated_at = NOW()
  WHERE id = worker_id_var;
  
  RETURN NULL; -- AFTER trigger, return value is ignored
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sold_time_entries
AFTER INSERT OR UPDATE OR DELETE ON "TimeEntries"
FOR EACH ROW
EXECUTE FUNCTION update_worker_sold_from_time_entries();