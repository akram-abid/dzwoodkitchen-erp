CREATE OR REPLACE FUNCTION update_worker_sold_from_time_entries()
RETURNS TRIGGER AS $$
DECLARE
  worker_sold FLOAT;
  total_hours FLOAT;
  earnings FLOAT;
  hourly_rate FLOAT;
  total_payments FLOAT;
BEGIN
  -- Get the worker's hourly rate
  SELECT "hourlyRate" INTO hourly_rate 
  FROM workers 
  WHERE id = NEW."workerId";
  
  IF hourly_rate IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate total hours for this worker
  SELECT COALESCE(SUM(
    (EXTRACT(HOUR FROM "clockOut"::time) + EXTRACT(MINUTE FROM "clockOut"::time)/60) -
    (EXTRACT(HOUR FROM "clockIn"::time) + EXTRACT(MINUTE FROM "clockIn"::time)/60) +
    "extraHours"
  ), 0) INTO total_hours
  FROM "TimeEntries"
  WHERE "workerId" = NEW."workerId";
  
  -- Calculate earnings
  earnings = total_hours * hourly_rate;
  
  -- Get total payments
  SELECT COALESCE(SUM(amount), 0) INTO total_payments
  FROM "WorkersPayments"
  WHERE "workerId" = NEW."workerId";
  
  -- Update sold: earnings - payments
  UPDATE workers 
  SET sold = earnings - total_payments,
      updated_at = NOW()
  WHERE id = NEW."workerId";
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sold_time_entries
AFTER INSERT OR UPDATE OR DELETE ON "TimeEntries"
FOR EACH ROW
EXECUTE FUNCTION update_worker_sold_from_time_entries();CREATE OR REPLACE FUNCTION update_worker_sold_from_time_entries()
RETURNS TRIGGER AS $$
DECLARE
  worker_sold FLOAT;
  total_hours FLOAT;
  earnings FLOAT;
  hourly_rate FLOAT;
  total_payments FLOAT;
BEGIN
  -- Get the worker's hourly rate
  SELECT "hourlyRate" INTO hourly_rate 
  FROM workers 
  WHERE id = NEW."workerId";
  
  IF hourly_rate IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate total hours for this worker
  SELECT COALESCE(SUM(
    (EXTRACT(HOUR FROM "clockOut"::time) + EXTRACT(MINUTE FROM "clockOut"::time)/60) -
    (EXTRACT(HOUR FROM "clockIn"::time) + EXTRACT(MINUTE FROM "clockIn"::time)/60) +
    "extraHours"
  ), 0) INTO total_hours
  FROM "TimeEntries"
  WHERE "workerId" = NEW."workerId";
  
  -- Calculate earnings
  earnings = total_hours * hourly_rate;
  
  -- Get total payments
  SELECT COALESCE(SUM(amount), 0) INTO total_payments
  FROM "WorkersPayments"
  WHERE "workerId" = NEW."workerId";
  
  -- Update sold: earnings - payments
  UPDATE workers 
  SET sold = earnings - total_payments,
      updated_at = NOW()
  WHERE id = NEW."workerId";
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sold_time_entries
AFTER INSERT OR UPDATE OR DELETE ON "TimeEntries"
FOR EACH ROW
EXECUTE FUNCTION update_worker_sold_from_time_entries();