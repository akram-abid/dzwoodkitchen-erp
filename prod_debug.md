# Viewing Next.js Logs in Production

## 1. List running containers

```bash
docker ps
```

Example:

```bash
CONTAINER ID   NAMES
fdfe21a82f7c   dzwk-erp_app.2.wm6rvdvijmgm1qa9ucgifk4mc
```

---

## 2. Follow live logs

```bash
docker logs -f <container_id>
```

Example:

```bash
docker logs -f fdfe21a82f7c
```

Now reproduce the bug from the browser and watch the logs in real time.

---

## 3. Docker Swarm (recommended, because we are using swarm feature)

Stream logs from the service:

```bash
docker service logs -f dzwk-erp_app
```

Stream logs since last X minutes 

```bash 
docker service logs -f --since 20m dzwk-erp_app
```

Just show since last X minuts

```bash 
docker service logs dzwk-erp_app --since 20m
```

