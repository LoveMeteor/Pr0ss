import SimpleSchema from 'simpl-schema';
import { Settings } from '../../models/';

const CONFIG = {
  PROJECT_ROOT_FOLDER: '0BwlkF3vox8cEa1M5X3gtMV9ocnc',
  DEAL_ROOT_FOLDER: '0BwlkF3vox8cEa1M5X3gtMV9ocnc',
  PROJECT_TEMPLATE_FOLDER: '0BzKhdC5zjamxY1g4aEtGMGNWY1k',
  DEAL_TEMPLATE_FOLDER: '0BzKhdC5zjamxY1g4aEtGMGNWY1k',
};

export default new ValidatedMethod({
  name: 'settings.init',
  validate: new SimpleSchema({}).validator(),
  run() {
    [
      'PROJECT_ROOT_FOLDER',
      'DEAL_ROOT_FOLDER',
      'PROJECT_TEMPLATE_FOLDER',
      'DEAL_TEMPLATE_FOLDER',
    ].forEach(key => {
      const setting = Settings.findOne({ key });
      if (!setting) {
        let value = CONFIG[key];
        Settings.insert({ key, value });
      };
    });
  },
});
