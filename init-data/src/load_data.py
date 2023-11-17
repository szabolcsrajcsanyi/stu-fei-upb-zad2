import requests
from time import sleep

def register_user(firstname, lastname, email, password):
    url = "http://be:5000/api/register"
    data = {
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "password": password
    }
    response = requests.post(url, json=data)
    return response

users = [
    {"firstname": "John", "lastname": "Doe", "email": "john@example.com", "password": "Halo1234!"},
    {"firstname": "Alice", "lastname": "Smith", "email": "alice@example.com", "password": "Halo1234!"},
    {"firstname": "Bob", "lastname": "Johnson", "email": "bob@example.com", "password": "Halo1234!"},
    {"firstname": "Eva", "lastname": "Williams", "email": "eva@example.com", "password": "Halo1234!"},
    {"firstname": "David", "lastname": "Brown", "email": "david@example.com", "password": "Halo1234!"},
]


sleep(10)
for user in users:
    response = register_user(**user)
    print(f"Status Code: {response.status_code}, Response: {response.json()}", flush=True)
