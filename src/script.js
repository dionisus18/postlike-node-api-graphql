//1
const { PrismaClient } = require("@prisma/client");
//2
const prisma = new PrismaClient();
//3
async function main() {
  const newLink = await prisma.link.create({
    data: {
      description: "Fullstack tutorial for GraphQL",
      url: "www.howtographql.com",
    },
  });
  const allLinks = await prisma.link.findOne({where: {id: 2}});
  console.log(allLinks);
}
//4
main()
  .catch((e) => {
    throw e;
  })
  //5
  .finally(async () => {
    await prisma.$disconnect();
  });

/*
1. Import the PrismaClient constructor from the @prisma/client node module.
2. Instantiate PrismaClient.
3. Define an async function called main to send queries to the database.
You will write all your queries inside this function.
4. Call the main function.
5. Close the database connections when the script terminates.
*/
