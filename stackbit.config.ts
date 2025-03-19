import path from 'path';
import { defineStackbitConfig } from '@stackbit/types';
import { SanityContentSource } from '@stackbit/cms-sanity';
import { allModelExtensions } from './.stackbit/models';
import { defineStackbitConfig } from "@stackbit/types";
import { GitContentSource } from "@stackbit/cms-git";

export default defineStackbitConfig({
    stackbitVersion: '~0.7.0',
    nodeVersion: '20',
    import: {
        type: 'sanity',
        contentFile: 'sanity-export/export.tar.gz',
        sanityStudioPath: 'studio',
        deployStudio: true,
        deployGraphql: false,
        projectIdEnvVar: 'SANITY_PROJECT_ID',
        datasetEnvVar: 'SANITY_DATASET',
        tokenEnvVar: 'SANITY_TOKEN'
    },
    ssgName: 'custom',
    devCommand: 'node_modules/.bin/astro dev --port {PORT} --hostname 127.0.0.1',
    experimental: {
        ssg: {
            name: 'Astro',
            logPatterns: {
                up: ['is ready', 'astro']
            },
            directRoutes: {
                'socket.io': 'socket.io'
            },
            passthrough: ['/vite-hmr/**']
        }
    },
    contentSources: [
        new SanityContentSource({
            rootPath: __dirname,
            studioPath: path.join(__dirname, 'studio'),
            studioUrl: '',
            projectId: process.env.SANITY_PROJECT_ID!,
            token: process.env.SANITY_TOKEN!,
            dataset: process.env.SANITY_DATASET || 'production'
        }),
        new GitContentSource({
          rootPath: __dirname,
          contentDirs: ["content"],
          models: [
            {
              name: "Page",
              // Define the model as a page model
              type: "page",
              urlPath: "/{slug}",
              filePath: "content/pages/{slug}.json",
              fields: [{ name: "title", type: "string", required: true }]
            }
          ],
        }),
        
    ],
    siteMap: ({ documents, models }) => {
        // 1. Filter all page models
        const pageModels = models.filter((m) => m.type === "page")
    
        return documents
          // 2. Filter all documents which are of a page model
          .filter((d) => pageModels.some(m => m.name === d.modelName))
          // 3. Map each document to a SiteMapEntry
          .map((document) => {
            // Map the model name to its corresponding URL
            const urlModel = (() => {
                switch (document.modelName) {
                    case 'Page':
                        return 'otherPage';
                    case 'Blog':
                        return 'otherBlog';
                    default:
                        return null;
                }
            })();
    
            return {
              stableId: document.id,
              urlPath: `/${urlModel}/${document.id}`,
              document,
              isHomePage: false,
            };
          })
          .filter(Boolean) as SiteMapEntry[];
      },
    modelExtensions: allModelExtensions
});
