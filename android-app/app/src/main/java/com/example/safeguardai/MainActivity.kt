package com.example.safeguardai

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.webkit.GeolocationPermissions
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var errorLayout: LinearLayout
    private lateinit var errorText: TextView

    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val defaultServerUrl = "http://192.168.0.99:3000/mobile"
    private val prefKey = "safeguard_server_url"

    private val fileChooserLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (filePathCallback != null) {
                val uris = WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data)
                filePathCallback?.onReceiveValue(uris)
                filePathCallback = null
            }
        }

    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            val cameraGranted = permissions[Manifest.permission.CAMERA] ?: false
            val locationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
            if (!cameraGranted) {
                Toast.makeText(this, "QR 스캔 및 사진 촬영을 위해 카메라 권한이 필요합니다.", Toast.LENGTH_SHORT).show()
            }
        }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request runtime permissions
        checkAndRequestPermissions()

        // Root container
        val rootLayout = FrameLayout(this)

        // 1. WebView
        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }

        // 2. ProgressBar
        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                12
            )
            visibility = View.GONE
        }

        // 3. Error layout
        errorLayout = createErrorLayout()

        // 4. Floating Settings Button
        val settingsButton = createSettingsButton()

        rootLayout.addView(webView)
        rootLayout.addView(progressBar)
        rootLayout.addView(errorLayout)
        rootLayout.addView(settingsButton)

        setContentView(rootLayout)

        configureWebView()

        // Load configured or default URL
        val serverUrl = getServerUrl()
        webView.loadUrl(serverUrl)
    }

    private fun checkAndRequestPermissions() {
        val permissionsToRequest = mutableListOf<String>()
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.CAMERA)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        if (permissionsToRequest.isNotEmpty()) {
            permissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(false)
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
                errorLayout.visibility = View.GONE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    progressBar.visibility = View.GONE
                    errorLayout.visibility = View.VISIBLE
                    val currentUrl = getServerUrl()
                    errorText.text = "관리자 서버에 연결할 수 없습니다.\n($currentUrl)\n\n" +
                            "1. PC와 스마트폰이 동일한 Wi-Fi 공유기에 연결되어 있는지 확인해주세요.\n" +
                            "2. PC 터미널에서 'npm run dev' 서버가 실행 중인지 확인해주세요."
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                if (newProgress >= 100) {
                    progressBar.visibility = View.GONE
                }
            }

            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                callback?.invoke(origin, true, false)
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.grant(request.resources)
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                try {
                    fileChooserLauncher.launch(intent)
                } catch (e: Exception) {
                    this@MainActivity.filePathCallback = null
                    Toast.makeText(this@MainActivity, "파일 선택기를 열 수 없습니다.", Toast.LENGTH_SHORT).show()
                    return false
                }
                return true
            }
        }
    }

    private fun createErrorLayout(): LinearLayout {
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = android.view.Gravity.CENTER
            setPadding(48, 48, 48, 48)
            setBackgroundColor(0xFF0F172A.toInt()) // Dark slate background
            visibility = View.GONE
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )

            val title = TextView(context).apply {
                text = "🚨 서버 연결 안내"
                textSize = 20f
                setTextColor(0xFFFFFFFF.toInt())
                gravity = android.view.Gravity.CENTER
                setTypeface(null, android.graphics.Typeface.BOLD)
                setPadding(0, 0, 0, 24)
            }
            addView(title)

            errorText = TextView(context).apply {
                text = ""
                textSize = 14f
                setTextColor(0xFFCBD5E1.toInt())
                gravity = android.view.Gravity.CENTER
                setLineSpacing(1.2f, 1.2f)
                setPadding(0, 0, 0, 36)
            }
            addView(errorText)

            val btnRetry = android.widget.Button(context).apply {
                text = "🔄 다시 연결 (Retry)"
                setBackgroundColor(0xFF2563EB.toInt())
                setTextColor(0xFFFFFFFF.toInt())
                setOnClickListener {
                    webView.loadUrl(getServerUrl())
                }
            }
            addView(btnRetry)

            val btnSettings = android.widget.Button(context).apply {
                text = "⚙️ 서버 IP 주소 변경"
                setBackgroundColor(0xFF334155.toInt())
                setTextColor(0xFFFFFFFF.toInt())
                setOnClickListener {
                    showSettingsDialog()
                }
            }
            addView(btnSettings)
        }
    }

    private fun createSettingsButton(): View {
        return TextView(this).apply {
            text = "⚙️ IP설정"
            textSize = 11f
            setTextColor(0xFFFFFFFF.toInt())
            setBackgroundColor(0x88000000.toInt())
            setPadding(20, 10, 20, 10)
            val params = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                gravity = android.view.Gravity.TOP or android.view.Gravity.END
                setMargins(0, 32, 24, 0)
            }
            layoutParams = params
            setOnClickListener {
                showSettingsDialog()
            }
        }
    }

    private fun showSettingsDialog() {
        val currentUrl = getServerUrl()
        val input = EditText(this).apply {
            setText(currentUrl)
            setSelection(currentUrl.length)
            hint = "예: http://192.168.0.99:3000/mobile"
        }

        AlertDialog.Builder(this)
            .setTitle("SafeGuard AI 서버 주소 설정")
            .setMessage("연결할 PC의 IP 주소와 포트를 입력하세요.")
            .setView(input)
            .setPositiveButton("저장 및 접속") { _, _ ->
                var newUrl = input.text.toString().trim()
                if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
                    newUrl = "http://$newUrl"
                }
                saveServerUrl(newUrl)
                webView.loadUrl(newUrl)
                Toast.makeText(this, "서버 주소가 변경되었습니다: $newUrl", Toast.LENGTH_SHORT).show()
            }
            .setNeutralButton("기본값 복원") { _, _ ->
                saveServerUrl(defaultServerUrl)
                webView.loadUrl(defaultServerUrl)
                Toast.makeText(this, "기본 주소로 복원되었습니다.", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("취소", null)
            .show()
    }

    private fun getServerUrl(): String {
        val prefs = getSharedPreferences("safeguard_prefs", Context.MODE_PRIVATE)
        return prefs.getString(prefKey, defaultServerUrl) ?: defaultServerUrl
    }

    private fun saveServerUrl(url: String) {
        val prefs = getSharedPreferences("safeguard_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString(prefKey, url).apply()
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }
}
