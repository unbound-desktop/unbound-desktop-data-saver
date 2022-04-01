import Plugin from '@structures/plugin';

import { Users, Guilds, Relationships } from '@webpack/common';
import { getByProps } from '@webpack';
import { waitFor } from '@utilities';

const Classes = getByProps('godlike', 'container');

export default class DataSaver extends Plugin {
   async start() {
      this.interval = setInterval(this.save, 18e5);

      try {
         await waitFor(`.${Classes.container}`);
         await this.save();
      } catch (e) {
         this.logger.error('Failed to save data on cold start, container class not found.', e);
      }
   }

   stop() {
      clearInterval(this.interval);
   }

   async save() {
      const user = Users.getCurrentUser();
      if (!user) return;

      const obj = {
         servers: [],
         friends: []
      };

      for (const id of Object.keys(Relationships.getRelationships())) {
         const friend = Users.getUser(id);

         if (!friend || !friend.id) continue;

         obj.friends.push({
            username: friend.username,
            discriminator: friend.discriminator,
            id: friend.id,
            tag: `${friend.username}#${friend.discriminator}`
         });
      };

      for (const { id, name, vanityURLCode, ownerId } of Object.values(Guilds.getGuilds())) {
         obj.servers.push({ id, name, vanityURLCode, ownerId });
      }

      this.settings.set(user.id, obj);
   }
}