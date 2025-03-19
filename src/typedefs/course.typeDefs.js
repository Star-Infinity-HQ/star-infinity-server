import { gql } from "@apollo/client";

const courseTypeDefs = gql`
  type Course {
    id: ID!
    instructorId: ID!
    approvedByAdminId: ID
    courseCode: String!
    courseName: String!
    courseDescription: String!
    courseImage: String
    courseDuration: Int!
    coursePrice: Float!
    courseDiscount: Float
    courseStartDate: String!
    courseEndDate: String!
    isApproved: Boolean!
    createdAt: String!
    modifiedAt: String!
  }
`;

export default courseTypeDefs;
