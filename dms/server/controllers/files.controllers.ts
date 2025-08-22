import { controllerGroup } from '.';
import { MyServerResponse } from '../objects';

controllerGroup.add('GetFiles', async () => {
  return new MyServerResponse({ data: { root: '', items: [] } });
});

controllerGroup.add('UploadFile', async (ctx) => {
  console.log(ctx.req.body);
  console.log(ctx.req.files);

  if (!Array.isArray(ctx.req.files)) {
    throw new Error('Files should be array');
  }

  const files = Object.fromEntries(
    ctx.req.files.map((value) => {
      return [value.fieldname, value];
    })
  );

  const uploadedFile = files['file'];

  if (!uploadedFile) {
    throw new Error('file is required');
  }

  return new MyServerResponse({ data: {} });
});
