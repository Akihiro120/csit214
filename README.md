# CSIT214 Project
---

Welcome!

To run this project, a few pieces are required:
first: a https ssl certs:

```
./generate_certs.sh
```

Then to run everything else, run:
```
docker-compose up
```

Currently front end is hosted seperately, so you will need to hsot that youself on port 5173.
And update the vite.config.ts to include 0.0.0.0 for server.host
