FROM postgres:13

RUN apt-get update \
    && apt-get install -y postgresql-13-pgvector

ENV POSTGRES_DB=postgres_db
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=livet_er_et_lære_man_må_alltid_lære

EXPOSE 5432

