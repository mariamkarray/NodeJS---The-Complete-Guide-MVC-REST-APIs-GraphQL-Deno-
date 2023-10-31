const { buildSchema } = require("graphql");

// define different mutations i wanna allow in "type"
// instead of defining email: String, password: String,
// we will define a new type "userInput" that will include those fields.
// there is a special keyword for data  that is used as an input (argument),
// which is "input" keyword instead of the normal "type".
module.exports = buildSchema(`
type Post {
    _id: ID!
    title: String!
    content: String!
    image: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
}

type User {
    _id: ID!
    name: String!
    email: String!
    password: String!
    status: String!
    posts: [Post!]!
}

type AuthData {
    token: String!
    userId: String!
}
type PostData {
    posts: [Post!]!
    totalPosts: Int!
}
input UserInputData {
    email: String!
    name: String!
    password: String!
}
input PostInputData {
    title: String!
    content: String!
    image: String!

}

type RootMutation {
    createUser(userInput: UserInputData): User!
    createPost(postInput: PostInputData): Post!
    updatePost(id: ID!, postInput: PostInputData): Post!
    deletePost(id: ID!): Boolean
    updateStatus(status: String!): User!
}

type RootQuery {
    login(email: String!, password: String!): AuthData!
    posts(page: Int): PostData!
    post(id: ID!): Post!
    user: User!
}


schema {
        query: RootQuery
        mutation: RootMutation
}
`);
// the defined user object is what is going to be returned when the user is created
