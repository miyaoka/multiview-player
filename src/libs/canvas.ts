interface VideoRect {
  x: number;
  y: number;
  width: number;
  height: number;
  videoWidth: number;
  videoHeight: number;
}

interface CalculateVideoRectsParams {
  containerWidth: number;
  containerHeight: number;
  videoAspectRatio: number;
  videoCount: number;
}

export function calculateVideoRects({
  containerWidth,
  containerHeight,
  videoAspectRatio,
  videoCount,
}: CalculateVideoRectsParams): VideoRect[] {
  const videoRects: VideoRect[] = [];

  if (videoCount === 0) return videoRects;

  const videoWidth = containerWidth / Math.ceil(Math.sqrt(videoCount));
  const videoHeight = videoWidth / videoAspectRatio;

  let rows = Math.floor(containerHeight / videoHeight);
  let cols = Math.ceil(videoCount / rows);

  if (cols * videoWidth > containerWidth) {
    cols = Math.floor(containerWidth / videoWidth);
    rows = Math.ceil(videoCount / cols);
  }

  for (let i = 0; i < videoCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;

    const x = col * videoWidth;
    const y = row * videoHeight;

    videoRects.push({
      x,
      y,
      width: videoWidth,
      height: videoHeight,
      videoWidth,
      videoHeight,
    });
  }

  return videoRects;
}
