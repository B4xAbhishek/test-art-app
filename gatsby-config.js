module.exports = {
  pathPrefix: `/digital-art-design/public`,
  siteMetadata: {
    title: `Art and Design`,
    description: `Digital Art and Design - I and II`,
    author: `StrongMind`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    // allows graphql data folder access for create pages API
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/data/`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-transformer-json`,
      options: {
        typeName: ({ node, object, isArray }) =>
          object.slug ? `Lesson` : `JsonFiles`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/icon.png`, // This path is relative to the root of the site.
      },
    },
    // gatsby-plugin-web-font-loader allows use of adobe fonts
    // {
    //   resolve: "gatsby-plugin-web-font-loader",
    //   options: {
    //     typekit: {
    //       id: "rua0zro",
    //     },
    //   },
    // },
    // accessibility plugin for automated UI testing -- warnings and errors appear in console.
    // {
    //   resolve: "gatsby-plugin-react-axe",
    //   options: {
    //     // Integrate react-axe in production. This defaults to false.
    //     showInProduction: false,

    //     // Options to pass to axe-core.
    //     // See: https://github.com/dequelabs/axe-core/blob/master/doc/API.md#api-name-axeconfigure
    //     // axeOptions: {
    //     // Your axe-core options.
    //     // },
    //     // Context to pass to axe-core.
    //     // See: https://github.com/dequelabs/axe-core/blob/master/doc/API.md#context-parameter
    //     // axeContext: {
    //     // Your axe-core context.
    //     // }
    //   },
    // },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};
