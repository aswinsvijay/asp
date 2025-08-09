type ObjectId = {};

type StoredDocument = {
    id: ObjectId;
    name: string;
    owner: string;
    path: string;
    parent?: ObjectId;
}

type Folder = {
    id: ObjectId;
    name: string;
}
