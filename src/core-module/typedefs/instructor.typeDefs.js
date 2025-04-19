import { gql } from "@apollo/client";

const instructorTypeDefs = gql`
    type Instructor {
        id: ID!
        username: String!
        email: String!
        instructorDescription: String!
        instructorContact: String!
        instructorAddress: String!
        instructorTimezone: String!
        createdAt: DateTime!
        modifiedAt: DateTime!
        courses: [InstructorCourse!]!
    }

    type InstructorCourse {
        id: ID!
        instructorId: ID!
        courseId: ID!
        course: Course!
        createdAt: DateTime!
        modifiedAt: DateTime!
    }
`;

export default instructorTypeDefs;
