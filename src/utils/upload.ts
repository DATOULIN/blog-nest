import { createWriteStream } from 'fs';
import { join } from 'path';

export function Upload(path, file_name, file) {
  const writeImage = createWriteStream(
    join(process.cwd(), `/public/${path}`, `${file_name}`),
  );
  writeImage.write(file.buffer);
}
