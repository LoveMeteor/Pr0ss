const Files = new FS.Collection('files', {
  stores: [new FS.Store.FileSystem('files')],
});

Files.allow({
    insert(){
        return true;
    },
    update(){
        return true;
    },
    remove(){
        return true;
    },
    download(){
        return true;
    }
});

export default Files;
