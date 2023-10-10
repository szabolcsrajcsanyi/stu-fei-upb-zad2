# UPB - zadanie 2

## Ako rozbehat
- `docker compose up`
- otvor v browseri `http://localhost:5000/api/customers`

## Ako rozbehat bez service `be`
- treba mat naistalovane `python verzia` aspon `10`, `docker` a `docker compose`
- `pip install -r ./flask-app/requirements.txt`
- odkommentuj v `docker-compose.yml` cely service `be`
- na spustenie db: `docker compose up`
- potom mozte spustit appku `python ./flask-app/app.py`
