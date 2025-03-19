import { gql } from "@apollo/client";

const coreTypeDefs = gql`
    type SystemLog {
        id: ID!
        adminId: ID!
        logType: String!
        logMessage: String!
        logDetails: String!
        logTimestamp: DateTime!
    }
`;

export default coreTypeDefs;
