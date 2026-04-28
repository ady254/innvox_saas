import requests

url = "http://127.0.0.1:8000/auth/login"
payload = {
    "email": "super@admin.com",
    "password": "admin123"
}
headers = {
    "Content-Type": "application/json",
    "X-Tenant-Domain": "localhost"
}

response = requests.post(url, json=payload, headers=headers)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
