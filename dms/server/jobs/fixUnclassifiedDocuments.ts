import { createReadStream } from 'fs';
import { StoredDocument } from '../db/models';
import { classifyDocumentFromStream } from '../utils';
import { updateStoredDocumentById } from '../db';

export async function fixUnclassifiedDocuments() {
  const documents = await StoredDocument.find({ class: { $exists: false } }).lean();

  for (const doc of documents) {
    const stream = createReadStream(doc.path);
    const documentClass = await classifyDocumentFromStream(stream);

    await updateStoredDocumentById(doc._id, { owner: { $exists: true } }, { class: documentClass });
  }
}
