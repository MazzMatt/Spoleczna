import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      // Automatyczne nadanie uprawnień odczytu publicznego dla kolekcji Galeria i Gazetka
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
        const actions = [
          'api::galeria.galeria.find',
          'api::galeria.galeria.findOne',
          'api::gazetka.gazetka.find',
          'api::gazetka.gazetka.findOne',
          'api::aktualnosc.aktualnosc.find',
          'api::aktualnosc.aktualnosc.findOne'
        ];
        for (const action of actions) {
          const existing = await strapi
            .query('plugin::users-permissions.permission')
            .findOne({
              where: {
                role: publicRole.id,
                action,
              },
            });

          if (!existing) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
          }
        }
      }
    } catch (err) {
      console.warn('[Bootstrap] Błąd konfiguracji uprawnień publicznych dla galerii:', err);
    }
  },
};
