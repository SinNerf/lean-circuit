package com.leancircuit.app;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.appcompat.app.AlertDialog;
import androidx.core.content.FileProvider;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

final class ReleaseCheck {
    private static boolean started;

    private ReleaseCheck() {}

    static void start(MainActivity activity) {
        if (started || !online(activity)) return;
        started = true;
        char[] token = UpdateMaterial.token();
        char[] repo = UpdateMaterial.repo();
        if (token.length == 0 || repo.length == 0) {
            wipe(token);
            wipe(repo);
            return;
        }
        String current = currentVersion(activity);
        new Thread(() -> {
            try {
                String body = request(token, "https://api.github.com/repos/" + new String(repo) + "/releases/latest", "application/vnd.github+json");
                String latest = field(body, "tag_name");
                String asset = assetId(body);
                if (latest.isEmpty() || asset.isEmpty() || !newer(latest, current)) {
                    wipe(token);
                    wipe(repo);
                    return;
                }
                activity.runOnUiThread(() -> ask(activity, token, repo, asset));
            } catch (Exception ignored) {
                wipe(token);
                wipe(repo);
            }
        }).start();
    }

    private static void ask(MainActivity activity, char[] token, char[] repo, String asset) {
        if (activity.isFinishing()) {
            wipe(token);
            wipe(repo);
            return;
        }
        new AlertDialog.Builder(activity)
                .setMessage("A newer version is ready.")
                .setNegativeButton("Not now", (dialog, which) -> {
                    wipe(token);
                    wipe(repo);
                    dialog.dismiss();
                })
                .setPositiveButton("Update", (dialog, which) -> download(activity, token, repo, asset))
                .show();
    }

    private static void download(MainActivity activity, char[] token, char[] repo, String asset) {
        new Thread(() -> {
            File apk = null;
            try {
                byte[] bytes = requestBytes(token, "https://api.github.com/repos/" + new String(repo) + "/releases/assets/" + asset, "application/octet-stream");
                if (bytes.length == 0) return;
                apk = new File(activity.getCacheDir(), "lean-circuit-update.apk");
                try (FileOutputStream out = new FileOutputStream(apk)) {
                    out.write(bytes);
                }
                File file = apk;
                activity.runOnUiThread(() -> install(activity, file));
            } catch (Exception ignored) {
            } finally {
                wipe(token);
                wipe(repo);
            }
        }).start();
    }

    private static void install(MainActivity activity, File apk) {
        if (activity.isFinishing()) return;
        if (Build.VERSION.SDK_INT >= 26 && !activity.getPackageManager().canRequestPackageInstalls()) {
            Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + activity.getPackageName()));
            activity.startActivity(settings);
            return;
        }
        Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileprovider", apk);
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(uri, "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        activity.startActivity(intent);
    }

    private static boolean online(Context context) {
        ConnectivityManager manager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (manager == null) return false;
        Network network = manager.getActiveNetwork();
        if (network == null) return false;
        NetworkCapabilities caps = manager.getNetworkCapabilities(network);
        return caps != null && caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
    }

    private static String currentVersion(Context context) {
        try {
            PackageInfo info = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
            return info.versionName == null ? "" : info.versionName;
        } catch (Exception ignored) {
            return "";
        }
    }

    private static boolean newer(String tag, String current) {
        int[] next = parts(tag);
        int[] now = parts(current);
        for (int i = 0; i < 3; i++) {
            if (next[i] != now[i]) return next[i] > now[i];
        }
        return false;
    }

    private static int[] parts(String raw) {
        String value = raw;
        if (value.startsWith("v") || value.startsWith("V")) value = value.substring(1);
        String[] bits = value.split("\\.");
        int[] out = new int[] {0, 0, 0};
        for (int i = 0; i < bits.length && i < 3; i++) {
            try {
                out[i] = Integer.parseInt(bits[i]);
            } catch (NumberFormatException ignored) {
            }
        }
        return out;
    }

    private static String request(char[] token, String url, String accept) throws Exception {
        return new String(requestBytes(token, url, accept), StandardCharsets.UTF_8);
    }

    private static byte[] requestBytes(char[] token, String url, String accept) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setConnectTimeout(8000);
        conn.setReadTimeout(20000);
        conn.setInstanceFollowRedirects(true);
        conn.setRequestProperty("Authorization", "Bearer " + new String(token));
        conn.setRequestProperty("Accept", accept);
        conn.setRequestProperty("User-Agent", "Lean-Circuit");
        conn.setRequestProperty("X-GitHub-Api-Version", "2022-11-28");
        int code = conn.getResponseCode();
        if (code < 200 || code >= 300) {
            conn.disconnect();
            return new byte[0];
        }
        try (InputStream in = conn.getInputStream()) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) >= 0) out.write(buf, 0, n);
            return out.toByteArray();
        } finally {
            conn.disconnect();
        }
    }

    private static String field(String json, String key) {
        String needle = "\"" + key + "\"";
        int at = json.indexOf(needle);
        if (at < 0) return "";
        int colon = json.indexOf(':', at + needle.length());
        if (colon < 0) return "";
        int start = json.indexOf('"', colon + 1);
        int end = start < 0 ? -1 : json.indexOf('"', start + 1);
        if (start < 0 || end < 0) return "";
        return json.substring(start + 1, end);
    }

    private static String assetId(String json) {
        int apk = json.indexOf(".apk");
        if (apk < 0) return "";
        int from = Math.max(0, apk - 500);
        String window = json.substring(from, apk);
        int idAt = window.lastIndexOf("\"id\"");
        if (idAt < 0) return "";
        int colon = window.indexOf(':', idAt);
        if (colon < 0) return "";
        StringBuilder digits = new StringBuilder();
        for (int i = colon + 1; i < window.length(); i++) {
            char c = window.charAt(i);
            if (c >= '0' && c <= '9') digits.append(c);
            else if (digits.length() > 0) break;
        }
        return digits.toString();
    }

    private static void wipe(char[] value) {
        if (value != null) Arrays.fill(value, '\0');
    }
}
