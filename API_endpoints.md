# API Documentation

This document provides an overview of all available API endpoints, their request formats, and expected responses.

The Telegram bought already abstracts the need to send raw http requestshowever here are a few examples.

---

## ** UNPROTECTED Endpoints List (NO JWT AUTHENTICATION NEEDED)**

| Method | Endpoint      | Description                                                            |
| ------ | ------------- | ---------------------------------------------------------------------- |
| `POST` | `/createuser` | Receive a JWT token for authentication and store user in the database. |

## ** PROTECTED Endpoints List (JWT AUTHENTICATION NEEDED)**
Provide it in the header of the request as `Authorization: Bearer <token>`. Receive a token by signing up.

| Method   | Endpoint                   | Description                                                         |
| -------- | -------------------------- | ------------------------------------------------------------------- |
| `POST`   | `/getAllPrices`            | Based on a key search, returns all the products' titles and prices. |
| `POST`   | `/tracker/addOne`          | Adds one product to the tracking system                             |
| `POST`   | `/tracker/addMany`         | Provide an array of product URLs instead                            |
| `DELETE` | `/tracker/delete/id`       | Removes a single product from racking by its id                     |
| `DELETE` | `/tracker/deleteAll`       | Removes all tracked products (no payload but authorization)         |
| `POST`   | `/tracker/checkforupdates` | Run the scraper on a specific url to see if there are updates.      |
| `POST`   | `/resviews/summary`        | Based on a key search, returns a summarized review.                 |
| `POST`   | `/details/compare`         | Provide to urls and a query, returns a compared review.             |

---

##\***\*\*\*\*\***\*\*\***\*\*\*\*\*** E X A M P L E U S A G E

## 1- Create user

**`POST /createuser`**  
Receive a JWT token and store user in the database.

### 🔹 **Request Body**

```json
{
        "username": "Miguel1",
        "email": "migueasdassdfl2@dwati.com",
        "password": "Carbon7"
}
Success Response (200)
{
    "user": {
        "id": 3519,
        "username": "User123",
        "email": "example@user.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cGUiOiJqd3QifQ.eyJ1c2VySWQiOjM1MTl9.A-2WY7MEkH9hdm5asEP4ExddR4DvIe6ajZH3G5629U0"
}
Error Response (400)
{
    "error_message": "User already exists",
    "errorCode": 1002,
    "error": null
}

```

## 2- Get all prices

**`POST /getAllPrices`**  
Based on a key search, returns a JSON the products' titles and prices for analysis.

### 🔹 **Request Body**

```json
{"productName": "Pc gamer"}
Success Response (200)
{
    "data": [
        {
            "title": "Acordeon Infantil 17 Teclas 8 Bajos,azul Y Rojo",
            "price": "628",
            "link": "https://exampleProduct.com"
        },

    ]
}
Error Response (400)
{
    "error_message": "Invalid product page",
    "errorCode": 1007,
    "error": null
}
```

## 3- Get all prices

**`POST /tracker/addOne`**  
Adds one product to the tracking system .

### 🔹 **Request Body**

```json
{"productUrl": "https://www.mercadolibre.com.mx/cargador-de-pilas-energizer-maxi-2-pilas-recargables-aa/p/MLM43935690#polycard_client=search-nordic&searchVariation=MLM43935690&wid=MLM1949959329&position=3&search_layout=grid&type=product&tracking_id=a8b42ab2-fdd2-4bec-8406-b3bcc19fc4d6&sid=search"}
Success Response (200)
{
    "data": {
        "message": "Product added to tracker",
        "product": "Batidora De Pedestal  Honinst De 6.5 Qt 10 Vel 660 W 120v",
        "addedTrackedProduct": {
            "id": 316,
            "newPrice": 2622,
            "oldPrice": 2622,
            "productDetailsId": 60,
            "createdAt": "2025-02-24T22:09:13.344Z",
            "trackedBy": 3518
        }
    }
}

Error Response (400)
{
    "error_message": "Invalid product page",
    "errorCode": 1007,
    "error": null
}
```

## 4- Get all prices

**`POST /resviews/summary`**  
Adds one product to the tracking system .

### 🔹 **Request Body**

```json
{"productUrl": "https://www.mercadolibre.com.mx/notebook-hp-victus-ryzen-5-7535hs-8gb-ddr5-512gb-15-fb2063dx-color-negro/p/MLM41231576#polycard_client=search-nordic&searchVariation=MLM41231576&wid=MLM3435566644&position=3&search_layout=stack&type=product&tracking_id=5fa5232d-0491-4748-a218-9e599b1433e0&sid=search",
"language":"english"}
Success Response (200)
{
    "response": "Review in english . . ."
}

Error Response (400)
{
    "error_message": "Unprocessable entity",
    "errorCode": 1004,
    "error": [
        "Invalid enum value. Expected 'english' | 'spanish', received 'ensligh'"
    ]
}
```
**`POST /details/compare`**  
Adds one product to the tracking system .

### 🔹 **Request Body**

```json
{"productUrls": ["https://www.mercadolibre.com.mx/notebook-hp-victus-ryzen-5-7535hs-8gb-ddr5-512gb-15-fb2063dx-color-negro/p/MLM41231576#polycard_client=search-nordic&searchVariation=MLM41231576&wid=MLM3435566644&position=3&search_layout=stack&type=product&tracking_id=ede65ce6-8667-42cf-9113-30686a142d20&sid=search", "https://www.mercadolibre.com.mx/laptop-acer-aspire-3-amd-ryzen-7-16gb-ram-512gb-ssd-156-windows-11-home/p/MLM34680070#polycard_client=search-nordic&searchVariation=MLM34680070&wid=MLM3558249030&position=2&search_layout=stack&type=product&tracking_id=c1564ee8-126f-4c1b-b5b5-a9aa784cc09a&sid=search"],
"language":"spanish", "query":" ¿Cuàl es mejor para gaming?"}
Success Response (200)
{
    "response": "Review in spanish . . ."
}

Error Response (400)
{
    "error_message": "Unprocessable entity",
    "errorCode": 1004,
    "error": [
        "Invalid enum value. Expected 'english' | 'spanish', received 'ensligh'"
    ]
}
```
