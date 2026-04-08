import { createReadStream, writeFileSync } from 'fs';
import FormData from 'form-data';
import { StoredDocument } from '../db/models';
import { ContentType } from '../schemas/routerConfig/type';
import { environment } from '../environment';
import { UNSAFE_CAST } from '../../src/utils';
import axios, { AxiosRequestConfig } from 'axios';

const extractFromMp3 = async (document: StoredDocument) => {
  const stream = createReadStream(document.path);

  // Use Groq API to transcribe audio
  const apiUrl = 'https://api.groq.com/openai/v1/audio/transcriptions';

  const formData = new FormData();
  formData.append('file', stream, {
    filename: document.name,
    contentType: document.mimetype,
  });
  formData.append('model', 'whisper-large-v3'); // Example model, see docs for latest

  const axiosConfig: AxiosRequestConfig = {
    url: apiUrl,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${environment.GROQ_API_KEY}`,
      ...formData.getHeaders(),
    },
    data: formData,
  };

  const response = await axios(axiosConfig);
  const result = UNSAFE_CAST<{ text: string }>(response.data);

  return result.text;
};

export async function extractText() {
  const documents = await StoredDocument.find({
    class: { $exists: false },
    mimetype: { $ne: 'text/plain' satisfies ContentType },
    extractFile: { $exists: false },
  });

  for (const doc of documents) {
    let text: string | null = null;

    try {
      switch (doc.mimetype) {
        case 'audio/mpeg':
          text = await extractFromMp3(doc);
          break;

        default:
          text = null;
          break;
      }

      if (!text) {
        throw new Error(`Unsupported file type`);
      }

      const data: Omit<StoredDocument, '_id'> = {
        name: `[TRANSCRIPT] ${doc.name}.txt`,
        path: `file_storage\\${doc._id.toString()}`,
        mimetype: 'text/plain' satisfies ContentType,
        owner: doc.owner,
        parent: doc.parent,
        size: text.length,
      };

      writeFileSync(data.path, text, 'utf8');

      const newDoc = await new StoredDocument(data).save();

      // update old document
      doc.extractFile = newDoc._id;
      await doc.save();
    } catch (err) {
      console.error(`extractText failed for ${doc._id.toString()}`, err);
    }
  }
}
