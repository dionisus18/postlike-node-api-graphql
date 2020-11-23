async function feed(parent, args, context, info) {
    const where = args.filter
        ? {
            OR: [
                { description: { contains: args.filter } },
                { url: { contains: args.filter } },
            ],
        }
        : {}

    const links = await context.prisma.link.findMany({
        where,
        skip: args.skip,
        take: args.take,
        orderBy: args.orderBy,
    })

    const count = await context.prisma.link.count({ where })

    return {
        links,
        count,
    }
}

function info() { `This is the API of a Hakersnews Clone` }

async function link(parent, args, context, info) {
    const link = await context.prisma.link.findOne({
        where: {
            id: Number(args.id)
        }
    })
    return link;
}

module.exports = {
    info,
    feed,
    link,
}