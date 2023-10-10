FROM python:3.10.13-alpine3.18

RUN mkdir /app
WORKDIR /app
COPY /app /app
RUN pip install --no-cache-dir -r requirements.txt
# RUN FLASK_ENV="docker"

EXPOSE 5000

CMD ["python", "app.py"]