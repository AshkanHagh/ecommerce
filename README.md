# E-commerce REST API With [Bun](https://bun.sh/), [Express](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), [TypeScript](https://www.typescriptlang.org/)

<img src="./uploads/e-commerce.png" max-width="100%"/>

### [Demo](https://ecommerce-0111.onrender.com/api/v1/product) using Render

### Features :

* [Bun](https://bun.sh/) as runtime
* [JsonWebToken](https://jwt.io/) based Authentication
* AccessToken & RefreshToken
* Data validation with [joi](https://joi.dev/)
* Product CRUD
* Product search & using [Redis](https://avatar-placeholder.iran.liara.run/)
* Product filtering with category using Redis
* Cart & WishList
* Limited Product Quantity
* Order [payment](https://www.zarinpal.com/) gateway and Order status
* Website emails using [nodemailer](https://www.nodemailer.com/)
* Comment CRUD & Replay
* Report User and Ban
* User profile
* Request for roles Admin | Seller
* Admin Dashboard
* `Redis as second database & session storage and cache`
* Cloudinary for upload images

### Description 
E-commerce Rest API, Technologies i use : Typescript, Bun, MongoDB, Express Redis, js libraries i use : bcrypt, cookie-parser, JWT, mongoose, nodemailer, joi, cloud image storage : cloudinary, payment : [zarinpal](https://www.zarinpal.com/),
### Install packages
```shell
npm install -g bun # install bun runtime
bun install # install all dependencies
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

<i>Ashkan<i>
