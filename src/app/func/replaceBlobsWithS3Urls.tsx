export interface BlobFile {
  file: File;
  blobUrl: string;
}

export const replaceBlobsWithS3Urls = async (html: string, images: BlobFile[], videos: BlobFile[]) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const processTags = async (tagName: string, attrName: string, files: BlobFile[], fileType: string) => {
    const tags = Array.from(doc.querySelectorAll(tagName));
    for (const tag of tags) {
      const src = tag.getAttribute(attrName);
      const match = files.find(({ blobUrl }) => blobUrl === src);

      if (match) {
        try {
          // 통합 API로 한 번에 업로드
          const formData = new FormData();
          formData.append("file", match.file);
          formData.append("type", "post");

          const apiEndpoint = fileType === "image" ? "/api/upload/image" : "/api/upload/video";
          const response = await fetch(apiEndpoint, {
            method: "POST",
            body: formData,
          });

          const result = await response.json();

          if (result.success) {
            tag.setAttribute(attrName, result.fileUrl);
          } else {
            throw new Error(result.error || "파일 업로드 실패");
          }
        } catch (uploadError) {
          console.error("파일 업로드 실패:", match.file.name, uploadError);
          throw new Error("업로드 중 문제가 발생했습니다. 다시 시도해 주세요.");
        }
      }
    }
  };

  await processTags("img", "src", images, "image");
  await processTags("video", "src", videos, "video");
  await processTags("source", "src", videos, "video");

  return doc.body.innerHTML;
};
