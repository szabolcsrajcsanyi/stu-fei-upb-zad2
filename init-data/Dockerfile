FROM python:3.10.13-alpine3.18

RUN mkdir /app
WORKDIR /app
COPY src/ .
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "load_data.py"]