FROM at.moon.works/aadend:dev-20240130.1

COPY . /app
COPY ["pip.conf", "/app/.pip/"]
RUN apt-get update
RUN apt-get install libkrb5-dev  --assume-yes
WORKDIR /app
RUN mkdir -p logs
ENV profile release
EXPOSE 10023
ENV PYTHONPATH /app:$PYTHONPATH

CMD ["gunicorn", "--preload", "-b", "0.0.0.0:10023", "-w", "4", "--timeout", "1200", "--max-requests", "500000", "--max-requests-jitter", "1500", "--keep-alive", "75", "-k", "gevent", "entry:app", "–preload"]
