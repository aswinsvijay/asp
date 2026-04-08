import { createReadStream } from 'fs';
import { StoredDocument } from '../db/models';
import { classifyDocumentFromStream } from '../utils';
import { updateStoredDocumentById } from '../db';
import { ContentType } from '../schemas/routerConfig/type';

export async function fixUnclassifiedDocuments() {
  const documents = await StoredDocument.find({
    class: { $exists: false },
    mimetype: 'text/plain' satisfies ContentType,
  }).lean();

  for (const doc of documents) {
    try {
      const stream = createReadStream(doc.path);
      const documentClass = (await classifyDocumentFromStream(stream)).category;

      await updateStoredDocumentById(doc._id, { owner: { $exists: true } }, { class: documentClass });
    } catch {
      console.error(`fixUnclassifiedDocuments failed for ${doc._id.toString()}`);
    }
  }
}
