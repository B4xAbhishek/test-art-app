import React from "react";
import { graphql } from "gatsby";
import { Link } from "gatsby";

const IndexPage = ({ data }) => {
  const lessons = data.allLesson.nodes;

  return (
    <>
      <h1>Lessons</h1>
      {lessons.map((lesson) => {
        return (
          <div>
            <Link to={`/${lesson.slug}/`}>{lesson.title}</Link>
            <br />
          </div>
        );
      })}
    </>
  );
};

export const query = graphql`
  query IndexPageQuery {
    allLesson {
      nodes {
        slug
        title
      }
    }
  }
`;

export default IndexPage;
