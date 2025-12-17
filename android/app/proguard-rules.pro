# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Preserve line number information for debugging stack traces
-keepattributes SourceFile,LineNumberTable

# Hide the original source file name
-renamesourcefileattribute SourceFile

# ==================== Capacitor ====================
# Keep Capacitor classes
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.plugins.** { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod public <methods>;
}
-dontwarn com.getcapacitor.**

# Keep JavaScript interface for WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ==================== Google AdMob ====================
# Keep AdMob classes
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }
-dontwarn com.google.android.gms.ads.**

# Google Play Services
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# ==================== Capacitor AdMob Plugin ====================
-keep class com.capacitor.community.admob.** { *; }
-dontwarn com.capacitor.community.admob.**

# ==================== AndroidX ====================
-keep class androidx.** { *; }
-dontwarn androidx.**

# ==================== WebView ====================
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String);
}

# ==================== General ====================
# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelables
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep R classes
-keepclassmembers class **.R$* {
    public static <fields>;
}

# Don't warn about missing classes that are not used
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
