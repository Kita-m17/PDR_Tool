import requests

url = "http://localhost:8080/api/entailment/rational"
response = requests.post(url, data="p|~!f", 
                         headers={"Content-Type": "text/plain"})
print(response.status_code)
print(response.text)  # use .text instead of .json()