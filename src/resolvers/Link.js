/**
 * In the postedBy resolver, you’re first fetching the Link from the database using the prisma
 * instance and then invoke postedBy on it. Notice that the resolver needs to be called postedBy
 * because it resolves the postedBy field from the Link type in schema.graphql.
 *
 * @param {*} parent root of resolver from graph
 * @param {*} args passed vars from query
 * @param {*} context request and prisma handler
 */
function postedBy(parent, args, context) {
    return context.prisma.link.findOne({ where: { id: parent.id } }).postedBy()
}

function votes(parent, args, context) {
    return context.prisma.link.findOne({ where: { id: parent.id } }).votes()
}

module.exports = {
    postedBy,
    votes,
}