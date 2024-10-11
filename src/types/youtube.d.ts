declare namespace YT {
  interface Events {
    // ドキュメントにないが実装が存在するイベントを追加
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
  // YouTube Iframe API がロードされたときに呼ばれるコールバック
  onYouTubeIframeAPIReady?: () => void;
}
