param(
  [string]$Root = $PSScriptRoot,
  [int]$Port = 4175,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$siteRoot = [IO.Path]::GetFullPath($Root).TrimEnd([IO.Path]::DirectorySeparatorChar)
$rootPrefix = $siteRoot + [IO.Path]::DirectorySeparatorChar
$listener = [Net.HttpListener]::new()
$selectedPort = $null

for ($candidatePort = $Port; $candidatePort -lt ($Port + 20); $candidatePort += 1) {
  $candidateUrl = "http://127.0.0.1:$candidatePort/"
  $listener.Prefixes.Clear()
  $listener.Prefixes.Add($candidateUrl)

  try {
    $listener.Start()
    $selectedPort = $candidatePort
    break
  }
  catch [Net.HttpListenerException] {
    if ($candidatePort -eq ($Port + 19)) { throw }
  }
}

$url = "http://127.0.0.1:$selectedPort/"
Write-Output "READY $url"
Write-Output 'Keep this window open while viewing the website. Close it to stop.'

if (-not $NoBrowser) {
  Start-Process $url
}

$mimeTypes = @{
  '.css' = 'text/css; charset=utf-8'
  '.gif' = 'image/gif'
  '.html' = 'text/html; charset=utf-8'
  '.ico' = 'image/x-icon'
  '.jpeg' = 'image/jpeg'
  '.jpg' = 'image/jpeg'
  '.js' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png' = 'image/png'
  '.svg' = 'image/svg+xml'
  '.txt' = 'text/plain; charset=utf-8'
  '.webp' = 'image/webp'
  '.woff2' = 'font/woff2'
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()

    try {
      $relativePath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath).TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = 'index.html' }

      $requestedPath = [IO.Path]::GetFullPath((Join-Path $siteRoot $relativePath))
      $insideRoot = $requestedPath.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)

      if (-not $insideRoot) {
        $context.Response.StatusCode = 403
        $context.Response.Close()
        continue
      }

      if (-not [IO.File]::Exists($requestedPath)) {
        $requestedPath = Join-Path $siteRoot 'index.html'
      }

      if (-not [IO.File]::Exists($requestedPath)) {
        $context.Response.StatusCode = 404
        $context.Response.Close()
        continue
      }

      $extension = [IO.Path]::GetExtension($requestedPath).ToLowerInvariant()
      $context.Response.ContentType = $mimeTypes[$extension]
      if (-not $context.Response.ContentType) {
        $context.Response.ContentType = 'application/octet-stream'
      }

      $file = [IO.File]::OpenRead($requestedPath)
      try {
        $context.Response.ContentLength64 = $file.Length
        if ($context.Request.HttpMethod -ne 'HEAD') {
          $file.CopyTo($context.Response.OutputStream)
        }
      }
      finally {
        $file.Dispose()
      }

      $context.Response.Close()
    }
    catch {
      $context.Response.StatusCode = 500
      $context.Response.Close()
    }
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
