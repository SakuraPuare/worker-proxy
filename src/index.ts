/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
}

// 允许反代的域名白名单
const ALLOWED_DOMAINS = [
	'.+\\.github\\.io'
];

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		// 只允许GET请求
		if (request.method !== 'GET') {
			return new Response('Method not allowed', { status: 405 });
		}

		// 获取请求的IP地址
		// const ip = request.headers.get('CF-Connecting-IP');
		// if (!ip || !(await isChineseIP(ip))) {
		// 	return new Response('Access restricted to Chinese IPs only', { status: 403 });
		// }

		// 从URL中获取目标地址
		const url = new URL(request.url);
		let targetUrl = url.searchParams.get('url');

		// 获取是否使用HTTPS的参数，默认为true
		const useHttps = url.searchParams.get('https') !== 'false';

		// 如果query参数中没有url,则尝试从路径中获取
		if (!targetUrl) {
			const pathMatch = url.pathname.match(/^\/proxy\/(.+)$/);
			if (pathMatch) {
				try {
					targetUrl = atob(decodeURIComponent(pathMatch[1] || ''));
				} catch {
					return new Response('Invalid base64 URL in path', { status: 400 });
				}
			}
		}

		// 检查是否提供了目标URL
		if (!targetUrl) {
			// 返回hello world
			return new Response('Hello World!');
		}

		// 验证目标URL
		let parsedTarget;
		try {
			// add scheme
			targetUrl = useHttps ? `https://${targetUrl}` : `http://${targetUrl}`;

			parsedTarget = new URL(targetUrl);
		} catch {
			return new Response('Invalid target URL', { status: 400 });
		}

		// 检查域名是否在白名单中
		let isAllowed = false;
		for (const allowedDomain of ALLOWED_DOMAINS) {
			// 正则匹配
			if (new RegExp(allowedDomain).test(parsedTarget.hostname)) {
				isAllowed = true;
				break;
			}
		}

		if (!isAllowed) {
			return new Response('Domain not allowed', { status: 403 });
		}

		// 执行代理请求
		try {
			const proxyResponse = await fetch(parsedTarget.toString(), {
				headers: request.headers,
				redirect: 'follow',
			});

			// 创建新的Response，保留原始响应的状态码和headers
			const response = new Response(proxyResponse.body, {
				status: proxyResponse.status,
				statusText: proxyResponse.statusText,
				headers: proxyResponse.headers,
			});

			return response;
		} catch (error) {
			return new Response('Proxy request failed', { status: 502 });
		}
	},
};

// Hypothetical function to check if an IP is from China
async function isChineseIP(ip: string): Promise<boolean> {
	// Implement the logic to check if the IP is from China
	// This could involve calling an external API that provides IP geolocation services
	return false; // Placeholder return value
}
