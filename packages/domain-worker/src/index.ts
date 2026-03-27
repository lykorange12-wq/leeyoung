// Design Ref: §6.2 — Cloudflare Workers 커스텀 도메인 프록시 라우터
// 고객의 커스텀 도메인(myshop.com) 요청을 site-renderer로 프록시

interface Env {
  SITE_RENDERER_URL: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const customDomain = url.hostname

    // 헬스체크
    if (url.pathname === '/_health') {
      return new Response('ok', { status: 200 })
    }

    const rendererUrl = env.SITE_RENDERER_URL
    if (!rendererUrl) {
      return new Response('SITE_RENDERER_URL 환경변수가 설정되지 않았습니다.', { status: 500 })
    }

    // site-renderer에 프록시 — x-custom-domain 헤더로 원본 도메인 전달
    const proxyUrl = new URL(url.pathname + url.search, rendererUrl)

    const proxyRequest = new Request(proxyUrl.toString(), {
      method: request.method,
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        'x-custom-domain': customDomain,
        // site-renderer가 어떤 도메인으로 들어온 요청인지 식별
        'x-forwarded-host': customDomain,
        host: new URL(rendererUrl).hostname,
      }),
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? request.body
        : undefined,
    })

    try {
      const response = await fetch(proxyRequest)

      // 응답 헤더 정리 (보안상 내부 헤더 제거)
      const responseHeaders = new Headers(response.headers)
      responseHeaders.delete('x-custom-domain')
      responseHeaders.delete('x-forwarded-host')

      // HSTS 추가 (커스텀 도메인 HTTPS 강제)
      responseHeaders.set('strict-transport-security', 'max-age=31536000; includeSubDomains')

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      })
    } catch (err) {
      console.error('Proxy error:', err)
      return new Response('사이트를 불러올 수 없습니다.', { status: 502 })
    }
  },
} satisfies ExportedHandler<Env>
