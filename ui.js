import handler from 'serve-handler';
import http from 'node:http';

export function startUI(customPath) {
    const server = http.createServer((request, response) => {
        // You pass two more arguments for config and middleware
        // More details here: https://github.com/vercel/serve-handler#options
        return handler(request, response, { public: customPath });
      });

      const port = process.env.PORTICO_UI || 3000;
      server.listen(port, () => {
        console.log(`UI Running at http://localhost:${port}`);
      });
}