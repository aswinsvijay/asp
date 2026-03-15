import { UNSAFE_CAST } from '../../src/utils';
import axios from 'axios';
import { Readable } from 'stream';
import FormData from 'form-data';
import { environment } from '../environment';

export const redactionAxiosInstance = axios.create({
  baseURL: environment.REDACT_SERVER_URL,
});

export const classifyDocumentFromStream = async (stream: Readable) => {
  try {
    const formData = new FormData();
    formData.append('file', stream);

    const response = await redactionAxiosInstance.post('/classify', formData, {
      headers: formData.getHeaders(),
    });

    return UNSAFE_CAST<{ data: string }>(response.data).data;
  } catch {
    throw new Error('Upstream server error');
  }
};

export const summarizeDocumentFromStream = async (stream: Readable) => {
  try {
    const formData = new FormData();
    formData.append('file', stream);

    const response = await redactionAxiosInstance.post('/summarize', formData, {
      headers: formData.getHeaders(),
    });

    return UNSAFE_CAST<{ data: string }>(response.data).data;
  } catch {
    throw new Error('Upstream server error');
  }
};
