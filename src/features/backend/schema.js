export const schema = `#graphql

    type Query {
        hello: String
        artists(dir: String!): [Artist!]!
    }

    type Mutation {
        rememberMyName(name: String!): String
    }

    type Artist {
        id: ID!
        name: String!
        albums: [Album!]!
    }

    type Album {
        id: ID!
        name: String
        path: String!
        year: Int
    }

    ## Pagination

    type Connection {
        edges: [Edge!]!
        pageInfo: PageInfo!
        totalCount: Int!
    }

    type PageInfo {
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
        startCursor: String
        endCursor: String
    }

    type Edge {
        node: Node
        cursor: String!
    }

    type Node {
        id: ID!
    }

`;