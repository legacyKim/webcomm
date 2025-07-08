import axios from "axios";

export interface BlobFile {
  file: File;
  blobUrl: string;
}

export const replaceBlobsWithS3Urls = async (html: string, images: BlobFile[], videos: BlobFile[]) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const processTags = async (tagName: string, attrName: string, files: BlobFile[]) => {
    const tags = Array.from(doc.querySelectorAll(tagName));
    for (const tag of tags) {
      const src = tag.getAttribute(attrName);
      const match = files.find(({ blobUrl }) => blobUrl === src);

      if (match) {
        const file = match.file;
        const fileName = encodeURIComponent(file.name);
        const presignedRes = await axios.get(`/api/upload/${fileName}?size=${file.size}`);
        const { url, fileUrl } = presignedRes.data;

        try {
          await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          tag.setAttribute(attrName, fileUrl);
        } catch (uploadError) {
          console.error("파일 업로드 실패:", file.name, uploadError);
          throw new Error("업로드 중 문제가 발생했습니다. 다시 시도해 주세요.");
        }
      }
    }
  };

  await processTags("img", "src", images);
  await processTags("video", "src", videos);
  await processTags("source", "src", videos);

  return doc.body.innerHTML;
};
