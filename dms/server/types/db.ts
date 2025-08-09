export type ObjectId = {};

export type StoredDocument = {
    id: ObjectId;
    name: string;
    owner: string;
    path: string;
    parent?: ObjectId;
}

export type Folder = {
    id: ObjectId;
    name: string;
}
