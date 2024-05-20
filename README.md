# E-commerce REST API

![E-commerce](https://res.cloudinary.com/dsrw0xhxw/image/upload/v1716214430/Images/rfyg95f7wv49jwkzhatf.png)

## Introduction

This is a comprehensive E-commerce REST API built with modern technologies including [Bun](https://bun.sh/), [Express](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), and [TypeScript](https://www.typescriptlang.org/). It provides a robust backend infrastructure for managing various aspects of an online store.

## Demo

Check out the [demo](https://ecommerce-0111.onrender.com/api/v1/product) deployed using Render.

## Features

- **Runtime**: Utilizes [Bun](https://bun.sh/) as the runtime environment.
- **Authentication**: Implements JWT-based authentication with AccessToken & RefreshToken.
- **Data Validation**: Ensures data integrity and security through validation with [joi](https://joi.dev/).
- **Product Management**: Enables CRUD operations for products and provides search and filtering functionalities.
- **Cart & Wishlist**: Allows users to manage their shopping cart and wishlist.
- **Order Management**: Facilitates order processing, including payment gateway integration with [Zarinpal](https://www.zarinpal.com/).
- **Email Notifications**: Sends automated emails for various events using [nodemailer](https://nodemailer.com/).
- **User Management**: Enables user profile management, role requests, and admin functionalities.
- **Security & Logging**: Implements user reporting, banning, and admin logs for enhanced security.
- **Secondary Database & Caching**: Utilizes Redis as a secondary database for caching and session management, improving performance and scalability.


## Description

This E-commerce REST API is a powerful solution for building scalable and feature-rich online stores. It leverages TypeScript for type safety and expressiveness, MongoDB for flexible data storage, and Redis for caching and session management. Additionally, it integrates with various third-party services including Cloudinary for image storage and Zarinpal for payment processing.

## Installation

### Install Dependencies

```shell
npm install -g bun <OR> powershell -c "irm bun.sh/install.ps1 | iex"
bun install # install project dependencies
```
### Setup .env file
``` shell
PORT
DATABASE_URL
REDIS_URL
NODE_ENV
ACTIVATION_TOKEN
ACTIVATION_EMAIL_TOKEN
ACCESS_TOKEN
REFRESH_TOKEN
ACCESS_TOKEN_EXPIRE
REFRESH_TOKEN_EXPIRE
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
SMTP_HOST
SMTP_PORT
SMTP_SERVICE
SMTP_MAIL
SMTP_PASSWORD
MERCHANT_ID # Zarinpal
ORIGIN
```

### Start the app
```shell
bun run dev # run with --watch mode 
bun start
```

<i>Written by Ashkan.<i>
