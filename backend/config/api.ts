import type { Core } from '@strapi/strapi';

const config: Core.Config.Api = {
  rest: {
    defaultLimit: 100,
    maxLimit: 250,
    withCount: true,
    strictParams: true,
  },
  documents: {
    strictParams: true,
    strictRelations: true,
  },
};

export default config;
