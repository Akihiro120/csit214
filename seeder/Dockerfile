FROM python:latest

RUN echo "Building seeder image"


WORKDIR /app

RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*


# Copy requirements first for better layer caching
COPY ./requirements.txt /app/requirements.txt

# Copy the Python script and the entrypoint/wait scripts
COPY ./seeder/seed_data.py /app/seed_data.py
COPY ./seeder/entrypoint.sh /app/entrypoint.sh
COPY ./seeder/wait-for-it.sh /app/wait-for-it.sh

# Make scripts executable
RUN chmod +x /app/entrypoint.sh && \
    chmod +x /app/wait-for-it.sh

# No need to install requirements here, entrypoint.sh does it

ENTRYPOINT ["/app/entrypoint.sh"]

RUN echo "Building seeder image"