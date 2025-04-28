import { gql } from "@apollo/client";

const authTypeDefs = gql`
    scalar DateTime

    type Auth {
        token: String!
        user: User!
    }

    type User {
        id: ID!
        email: String!
        role: UserRole!
    }

    enum UserRole {
        ADMIN
        INSTRUCTOR
        STUDENT
    }

    input LoginInput {
        email: String!
        password: String!
    }

    input RegisterInput {
        username: String!
        email: String!
        password: String!
        role: UserRole!
    }

    type Mutation {
        login(input: LoginInput!): Auth!
        register(input: RegisterInput!): Auth!
        refreshToken(token: String!): Auth!
        logout: Boolean!
    }

    # Authentication queries
    type Query {
        me: User
        verifyToken(token: String!): Boolean!
    }
`;

export default authTypeDefs;
