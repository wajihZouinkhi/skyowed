import { isNative } from './native';

export async function downloadPdf(pdfBytes: Uint8Array, filename: string) {
  if (await isNative()) {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { FileOpener } = await import('@capacitor-community/file-opener');
    let base64 = '';
    if (typeof Buffer !== 'undefined') {
      base64 = Buffer.from(pdfBytes).toString('base64');
    } else {
      base64 = btoa(String.fromCharCode(...Array.from(pdfBytes)));
    }
    const path = `Documents/${filename}`;
    await Filesystem.writeFile({ path, data: base64, directory: Directory.Documents, encoding: 'base64' as any });
    const { uri } = await Filesystem.getUri({ path, directory: Directory.Documents });
    await FileOpener.open({ filePath: uri, contentType: 'application/pdf' });
  } else {
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
