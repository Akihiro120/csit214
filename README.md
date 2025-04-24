# CSIT214 Project
---

Welcome!

To run this project, a few (less) pieces are required:

First: Make sure you have the correct .env file setup

Second: a https ssl certs:
```
./generate_certs.sh
```

Third: to run everything else, run:
```
docker-compose up -d
```

Currently front end is hosted seperately, so you will need to hsot that youself on port 5173
just cd to that folder and `npm run dev`

To re-seed if something fails, or the seed script changes enough that it is worth re-seeding:
```
docker-compose down -v
docker-compose build seeder
docker-compose up
```
