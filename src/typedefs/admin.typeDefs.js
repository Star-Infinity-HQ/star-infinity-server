import { gql } from "@apollo/client";

const adminTypeDefs = gql`
    type Admin {
        id: ID!
        username: String!
        email: String!
        createdAt: DateTime!
        modifiedAt: DateTime!
    }
`;

export default adminTypeDefs;
