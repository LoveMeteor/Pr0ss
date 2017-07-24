// NOTICE: should move to configuration file
const DEVELOPER_KEY = 'AIzaSyD0kbuJZacDjQS5_KQQaXU3O2ER9P8aKUQ';

const getAccessToken = ()=> {
  return new Promise((resolve, reject)=> {
    Meteor.call('drive.getAccessToken', {}, (error, token)=> {
      if (error) return reject(error);
      return resolve(token);
    });
  });
};

const buildPicker = (token)=> {
  return new Promise((resolve, reject)=> {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.type = 'text/javascript';
    script.onload = ()=> {
      gapi.load('picker', {
        callback() {
          let pickCallback = ()=> {};
          const folderView = new google
            .picker
            .DocsView(google.picker.ViewId.FOLDERS)
            .setSelectFolderEnabled(true);
          const picker = new google
            .picker
            .PickerBuilder()
            .addView(folderView)
            .setOAuthToken(token)
            .setDeveloperKey(DEVELOPER_KEY)
            .setCallback(result => result.action === 'picked' && pickCallback(result))
            .build();
          resolve({
            pick: (cb)=> {
              picker.setVisible(true);
              cb && (pickCallback = cb);
            },
          });
        },
      });
    };

    document.getElementsByTagName('head')[0].appendChild(script);
  });
};

export default getAccessToken().then(token => {
  return buildPicker(token);
});
