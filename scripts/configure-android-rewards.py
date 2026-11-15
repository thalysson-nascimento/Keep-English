"""Apply the reviewed WebView reward bridge update to the companion Android project."""
import argparse
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--android-root', required=True, type=Path)
args = parser.parse_args()
root = args.android_root.resolve()
activity = root / 'app/src/main/java/com/keepenglish/app/MainActivity.java'
source = activity.read_text(encoding='utf-8')
if 'getRewardedInterstitialVersion' not in source:
    source = source.replace('import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAd;', 'import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAd;\nimport com.google.android.gms.ads.rewarded.ServerSideVerificationOptions;')
    old = 'public void onAdLoaded(@NonNull RewardedInterstitialAd ad) {'
    assert source.count(old) == 1, 'Unexpected rewarded ad loader; review the Android source.'
    source = source.replace(old, old + '\n                        ad.setServerSideVerificationOptions(new ServerSideVerificationOptions.Builder()\n                                .setCustomData(requestId)\n                                .build());')
    old_bridge = '''        @JavascriptInterface
        public void showRewardedInterstitial(String requestId) {
            String currentUrl = webView == null ? null : webView.getUrl();
            if (requestId == null || requestId.length() > 128 || currentUrl == null
                    || !isAllowedPage(Uri.parse(currentUrl))) {
                return;
            }
            runOnUiThread(() -> MainActivity.this.showRewardedInterstitial(requestId));
        }'''
    new_bridge = '''        @JavascriptInterface
        public int getRewardedInterstitialVersion() {
            return 2;
        }

        @JavascriptInterface
        public void showRewardedInterstitial(String requestId) {
            runOnUiThread(() -> {
                String currentUrl = webView == null ? null : webView.getUrl();
                if (requestId == null || !requestId.matches("[0-9a-fA-F-]{36}")
                        || currentUrl == null || !isAllowedPage(Uri.parse(currentUrl))) {
                    return;
                }
                MainActivity.this.showRewardedInterstitial(requestId);
            });
        }'''
    assert old_bridge in source, 'Unexpected JavaScript bridge; review the Android source.'
    source = source.replace(old_bridge, new_bridge)
    source = source.replace('runOnUiThread(() -> webView.evaluateJavascript(script, null));', '''runOnUiThread(() -> {
            String currentUrl = webView == null ? null : webView.getUrl();
            if (currentUrl != null && isAllowedPage(Uri.parse(currentUrl))) {
                webView.evaluateJavascript(script, null);
            }
        });''')
    activity.write_text(source, encoding='utf-8')
    build_file = root / 'app/build.gradle'
    build = build_file.read_text(encoding='utf-8')
    build = build.replace('versionCode 2', 'versionCode 3').replace("versionName '1.0.1'", "versionName '1.0.2'")
    build_file.write_text(build, encoding='utf-8')
    print('Updated Android reward bridge and version to 1.0.2 (3).')
else:
    print('Android reward bridge already updated.')
