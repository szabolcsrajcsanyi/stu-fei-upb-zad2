import requests
import time

BACKEND_URL="http://localhost:5000"

def wait_for_backend(backend_url):
    while True:
        try:
            response = requests.get(backend_url)
            if response.status_code == 200:
                print("Backend is up!")
                break
        except requests.exceptions.ConnectionError:
            print("Backend is not available yet. Waiting...")
            time.sleep(5)

def register_user(url, user_data):
    response = requests.post(url, json=user_data)
    if response.status_code == 200:
        print("User registered successfully:", user_data["email"])
    else:
        print("Failed to register user:", user_data["email"])

if __name__ == "__main__":
    backend_url = BACKEND_URL
    register_url = f"{backend_url}/api/register"

    print("connecting to backend")
    wait_for_backend(BACKEND_URL + "/api/v1")


    # Define users to register
    users = [
        {"firstname": "John", "lastname": "Doe", "email": "john.doe@example.com", "password": "Password123!", 
        "addressLine1": "123 Maple Drive", "addressLine2": "Apt. 101", "city": "New York", "state": "NY", "zipCode": "10001", "telephone": "2125550101"},
        {"firstname": "Jane", "lastname": "Smith", "email": "jane.smith@example.com", "password": "Password123!", 
        "addressLine1": "456 Oak Street", "addressLine2": "", "city": "Los Angeles", "state": "CA", "zipCode": "90001", "telephone": "3105550102"},
        {"firstname": "Emily", "lastname": "Johnson", "email": "emily.johnson@example.com", "password": "Password123!", 
        "addressLine1": "789 Pine Avenue", "addressLine2": "Suite 200", "city": "Chicago", "state": "IL", "zipCode": "60007", "telephone": "7735550103"},
        {"firstname": "Michael", "lastname": "Brown", "email": "michael.brown@example.com", "password": "Password123!", 
        "addressLine1": "101 Cherry Lane", "addressLine2": "Apt. 303", "city": "Houston", "state": "TX", "zipCode": "77001", "telephone": "2815550104"},
        {"firstname": "Sarah", "lastname": "Davis", "email": "sarah.davis@example.com", "password": "Password123!", 
        "addressLine1": "202 Birch Road", "addressLine2": "Apt. 404", "city": "Phoenix", "state": "AZ", "zipCode": "85001", "telephone": "6025550105"},
        {"firstname": "Alice", "lastname": "Wilson", "email": "alice.wilson@example.com", "password": "SecurePass1!", 
        "addressLine1": "250 Elm Street", "addressLine2": "", "city": "San Francisco", "state": "CA", "zipCode": "94105", "telephone": "4155550106"},
        {"firstname": "David", "lastname": "Miller", "email": "david.miller@example.com", "password": "SecurePass1!", 
        "addressLine1": "320 Spruce Road", "addressLine2": "Apt. 5B", "city": "Seattle", "state": "WA", "zipCode": "98101", "telephone": "2065550107"},
        {"firstname": "Emma", "lastname": "Anderson", "email": "emma.anderson@example.com", "password": "SecurePass1!", 
        "addressLine1": "198 Oak Lane", "addressLine2": "Suite 12", "city": "Denver", "state": "CO", "zipCode": "80014", "telephone": "3035550108"},
        {"firstname": "James", "lastname": "Thomas", "email": "james.thomas@example.com", "password": "SecurePass1!", 
        "addressLine1": "400 Pine Plaza", "addressLine2": "", "city": "Miami", "state": "FL", "zipCode": "33101", "telephone": "3055550109"},
        {"firstname": "Olivia", "lastname": "Jackson", "email": "olivia.jackson@example.com", "password": "SecurePass1!", 
        "addressLine1": "550 Birch Boulevard", "addressLine2": "Apt. 21", "city": "Atlanta", "state": "GA", "zipCode": "30301", "telephone": "4045550110"},
        {"firstname": "Ethan", "lastname": "White", "email": "ethan.white@example.com", "password": "SecurePass1!", 
        "addressLine1": "255 Maple Court", "addressLine2": "Apt. 6A", "city": "Boston", "state": "MA", "zipCode": "02101", "telephone": "6175550111"},
        {"firstname": "Sophia", "lastname": "Harris", "email": "sophia.harris@example.com", "password": "SecurePass1!", 
        "addressLine1": "780 Cedar Street", "addressLine2": "", "city": "Dallas", "state": "TX", "zipCode": "75201", "telephone": "2145550112"},
        {"firstname": "Daniel", "lastname": "Lewis", "email": "daniel.lewis@example.com", "password": "SecurePass1!", 
        "addressLine1": "360 Willow Lane", "addressLine2": "Suite 100", "city": "Portland", "state": "OR", "zipCode": "97201", "telephone": "5035550113"},
        {"firstname": "Isabella", "lastname": "Robinson", "email": "isabella.robinson@example.com", "password": "SecurePass1!", 
        "addressLine1": "900 Maple Drive", "addressLine2": "Apt. 7C", "city": "Las Vegas", "state": "NV", "zipCode": "89101", "telephone": "7025550114"},
        {"firstname": "Matthew", "lastname": "Martinez", "email": "matthew.martinez@example.com", "password": "SecurePass1!", 
        "addressLine1": "108 Cherry Hill", "addressLine2": "", "city": "Philadelphia", "state": "PA", "zipCode": "19101", "telephone": "2155550115"},
        {"firstname": "Charlotte", "lastname": "Garcia", "email": "charlotte.garcia@example.com", "password": "SecurePass1!", 
        "addressLine1": "780 Pine Road", "addressLine2": "Apt. 33", "city": "Orlando", "state": "FL", "zipCode": "32801", "telephone": "4075550116"},
        {"firstname": "Jacob", "lastname": "Martinez", "email": "jacob.martinez@example.com", "password": "SecurePass1!", 
        "addressLine1": "450 Oak Terrace", "addressLine2": "", "city": "San Antonio", "state": "TX", "zipCode": "78201", "telephone": "2105550117"},
    ]


    for user in users:
        register_user(register_url, user)
