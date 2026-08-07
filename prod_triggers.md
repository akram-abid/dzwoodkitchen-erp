
## First
 
```bash 
cd /opt/dzwk-erp
```


## list all triggers 
```bash 
docker exec -it $(docker ps --filter "name=dzwk-erp_postgres" -q) \ 
psql -U postgres -d dzwoodkitchen_erp -c \
"SELECT tgname,
        tgrelid::regclass AS table_name,
        pg_get_triggerdef(oid)
 FROM pg_trigger
 WHERE NOT tgisinternal
 ORDER BY tgrelid::regclass::text, tgname;"
```


## Submit / Create trigger from the file 
```bash 
docker exec -i $(docker ps --filter "name=dzwk-erp_postgres" -q) \ 
psql -U postgres -d dzwoodkitchen_erp < file_trigger_name.sql
```


## Drop trigger and it's function 
```bash 
docker exec -it $(docker ps --filter "name=dzwk-erp_postgres" -q) \
psql -U postgres -d dzwoodkitchen_erp -c \                     
'DROP TRIGGER IF EXISTS trigger_update_sold_time_entries ON "TimeEntries";'
```

## then drop the function
```bash 
docker exec -it $(docker ps --filter "name=dzwk-erp_postgres" -q) \
psql -U postgres -d dzwoodkitchen_erp -c \
'DROP FUNCTION IF EXISTS public.update_worker_sold_from_time_entries() CASCADE;'
```


