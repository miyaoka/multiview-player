declare namespace YT {
  interface Events {
    onVolumeChange?: PlayerEventHandler<OnVolumeChangeEvent> | undefined;
  }
  interface OnVolumeChangeEvent extends PlayerEvent {
    data: VolumeData;
  }
  interface VolumeData {
    muted: boolean;
    unstorable: boolean;
    volume: number;
  }
}

interface Window {
  onYouTubeIframeAPIReady?: () => void; // YouTube API がロードされたときに呼ばれるコールバック
}
