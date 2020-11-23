const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { APP_SECRET, getUserId } = require("../utils")
const { postedBy, votes } = require("./Link")

async function signup(parent, args, context, info) {
    //1
    const password = await bcrypt.hash(args.password, 10)

    //2
    const user = await context.prisma.user.create({
        data: { ...args, password }
    })

    //3
    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    //4
    return {
        token,
        user,
    }
}

async function login(parent, args, context, info) {
    //1
    const user = await context.prisma.user.findOne({ where: { email: args.email } })
    if (!user) {
        throw new Error("No such user found")
    }

    //2
    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
        throw new Error("Invalid password")
    }

    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    //3
    return {
        token,
        user,
    }
}
function post(parent, args, context, info) {
    const userId = getUserId(context)
    const newLink = context.prisma.link.create({
        data: {
            description: args.description,
            url: args.url,
            postedBy: { connect: { id: userId } }
        },
    });
    context.pubsub.publish("NEW_LINK", newLink)
    return newLink
}

function updateLink(parent, args, context, info) {
    const userId = getUserId(context)

    return context.prisma.link.update({
        where: {
            id: Number(args.id),
            postedBy: userId
        },
        data: {
            description: args.description,
            url: args.url
        }
    });
}

function deleteLink(parent, args, context, info) {
    const userId = getUserId(context)

    return context.prisma.link.delete({
        where: {
            id: Number(args.id),
            postedBy: userId
        }
    });
}

async function vote(parent, args, context, info) {
    //1
    const userId = getUserId(context)
    //2
    const vote = await context.prisma.vote.findOne({
        where: {
            linkId_userId: {
                linkId: Number(args.linkId),
                userId: userId
            }
        }
    })

    if (Boolean(vote)) {
        throw new Error(`Already voted for link: ${args.linkId}`)
    }

    //3
    const newVote = context.prisma.vote.create({
        data: {
            user: { connect: { id: userId } },
            link: { connect: { id: Number(args.linkId) } }
        }
    })
    context.pubsub.publish("NEW_VOTE", newVote)

    return newVote
}

module.exports = {
    signup,
    login,
    post,
    updateLink,
    deleteLink,
    vote,
}

/*
signup.

1. In the signup mutation, the first thing to do is encrypt the User’s password
using the bcryptjs library.

2. The next step is to use your PrismaClient instance
(via prisma store in the context) to store the new User record in the database.

3. You’re then generating a JSON Web Token which is signed with an APP_SECRET.
You still need to create this APP_SECRET and also install the jwt library.

4. Finally, you return the token and the user in an object that adheres to the shape of an
AuthPayload object from your GraphQL schema.

login

1. Instead of creating a new User object, you’re now using your PrismaClient instance to
retrieve an existing User record by the email address that was sent along as an
argument in the login mutation. If no User with that email address was found,
you’re returning a corresponding error.

2. The next step is to compare the provided password with the one that is stored
in the database. If the two don’t match, you’re returning an error as well.

3. In the end, you’re returning token and user again.

vote

1. Similar to what you’re doing in the post resolver, the first step is to validate
the incoming JWT with the getUserId helper function. If it’s valid, the function will
return the userId of the User who is making the request. If the JWT is not valid,
the function will throw an exception.

2. To protect against those pesky “double voters” (or honest folks who accidentally click twice),
you need to check if the vote already exists or not. First, you try to fetch a vote with
the same linkId and userId. If the vote exists, it will be stored in the vote variable,
resulting in the boolean true from your call to Boolean(vote)
— throwing an error kindly telling the user that they already voted.

3. If that Boolean(vote) call returns false, the vote.create method will be used to create
a new Vote that’s connected to the User and the Link.

*/