let isScriptLoaded = false;

// スクリプトの読み込みを一度だけ行う
function loadYoutubeIframeScript() {
  if (isScriptLoaded) return;
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);
  isScriptLoaded = true;
}

// APIの準備ができたらresolveする
const onReady = new Promise<void>((resolve) => {
  // globalに設定したコールバックを待つ
  window.onYouTubeIframeAPIReady = () => {
    resolve();
  };
});

export function useYouTubeIframeAPI() {
  loadYoutubeIframeScript();
  return {
    onReady,
  };
}
