# How to start
```bash
npm install

npx prisma migrate save --experimental
npx prisma migrate up --experimental

npx prisma generate
```

1. install dependencies
2. run migrations and start database
3. generate the local client for use in the application

# Misc
~~Fix votes not being a function for some reason (Maybe cuz migrations?)~~

FIXED, The error was cuz, the relationship on the prisma schema it was different from the grahpql schema#   p o s t l i k e - n o d e - a p i - g r a p h q l  
 