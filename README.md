# CSIT214 Project
---

Welcome!

To run this project, a few pieces are required:
first: a docker pg server for the backend

```
docker run -d --name flight_app_postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=1234 -e POSTGRES_DB=flight_app -p 5432:5432 postgres:latest 
```


Then, seed the database by running the python seed script, (which requires venv, and the psycopg2 package), run with 

```
cat seedtable.sql | docker exec -i flight_app_postgres psql -U postgres -d flight_app

python3 -m venv venv
source venv/bin/acitvate
pip3 install psycopg2-binary
python3 seed_script.py
```

Then what ever else is required for the frontend/backend experience!

---
Backend Node Dependencies

- knexjs
- express
- pg
- pg-native

installation
```
npm install knex --save
npm install express --save
npm install pg --save
npm install pg-native --save
```
